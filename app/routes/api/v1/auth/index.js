import _ from 'lodash'
import Promise from 'bluebird'

import makeResource, { methods } from 'resource'
import { authenticate, makeApiError, hash, catchNotFound, makeOwnershipVerifier } from 'utils'

import { Account, Role, Status } from 'models'

import schema from '../account/schema'


export default makeResource({
  endpoints: [
    {
      suffix: '/register',
      method: methods.POST,
      role: false,
      schema: _.pick(schema, ['email', 'display', 'password']),
      makeResponse({ bodyMaybe }) {
        return Account
        .where('email', bodyMaybe.email)
        .fetch()
        .then((r) => {
          // Verify uniqueness

          if (r) {
            return Promise.reject(makeApiError(400, 'Account with email already exists'))
          }
        })
        .then(() => {
          // Get default role and status first

          return Promise.all([
            Role.where('slug', 'user').fetch({ require: true }),
            Status.where('slug', 'okay').fetch({ require: true }),
          ])
        })
        .spread((role, status) => {
          // Hash password

          return hash(bodyMaybe.password)
          .catch((err) => {
            return Promise.reject(makeApiError(500, `Password hashing failed: ${err.message}`))
          })
          .then((password) => [role, status, password])
        })
        .spread((role, status, password) => {
          // Forge new account

          return Account
          .forge({
            ...bodyMaybe,
            password,
            role_id: role.get('id'),
            status_id: status.get('id')
          })
          .save()
          .then((account) => {
            // TODO enqueue new account registration email

            return account
          })
        })
      }
    },

    {
      suffix: '/login',
      method: methods.POST,
      role: false,
      schema: { email: schema.email, password: schema.password_login },
      makeResponse({ bodyMaybe }) {
        const { email, password } = bodyMaybe
        return authenticate(email, password)
      }
    },

    {
      method: methods.PATCH,
      role: 'user',
      schema: _.pick(schema, ['email', 'display']),
      makeResponse({ idMaybe, bodyMaybe }) {
        return Account
        .where('id', idMaybe)
        .fetch({ require: true })
        .catch(catchNotFound)
        .then(makeOwnershipVerifier(req, (r) => r.get('id')))
        .then((account) => {
          account.set(bodyMaybe)
          return account.save()
        })
      },
    },

    {
      suffix: '/password',
      method: methods.PUT,
      role: 'user',
      schema: _.pick(schema, ['password', 'password_confirmation']),
      prepareBody({ password }) {
        return hash(password)
        .catch((err) => {
          return Promise.reject(makeApiError(500, `Password hashing failed: ${err.message}`))
        })
        // put hashed password under password key
        .then((password) => ({ password }))
      },
      makeResponse({ req, idMaybe, bodyMaybe }) {
        return Account
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['role', 'status']
        })
        .catch(catchNotFound)
        .then(makeOwnershipVerifier(req, (r) => r.get('id')))
        .then((account) => {
          // set new hashed password (see prepareBody above)
          account.set(bodyMaybe)
          return account.save()
        })
      },
    },
  ]
})
