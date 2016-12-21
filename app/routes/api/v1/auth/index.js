import _ from 'lodash'
import Promise from 'bluebird'

import makeResource, { methods } from 'resource'
import { authenticate, makeApiError, hash, catchNotFoundOrConnError, makeOwnershipVerifier } from 'utils'
import { transact } from 'db'

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
        return transact((tmix) =>
          Account
          .where('email', bodyMaybe.email)
          .fetch(tmix)
          .then((r) => {
            // Verify uniqueness

            if (r) {
              return Promise.reject(makeApiError(400, 'Account with email already exists'))
            }

            return null
          })
          .then(() =>
            // Get default role and status first
            Promise.all([
              Role.where('slug', 'user').fetch({ ...tmix, require: true }),
              Status.where('slug', 'okay').fetch({ ...tmix, require: true }),
            ]))
          .spread((role, status) =>
            // Hash password
            hash(bodyMaybe.password)
            .catch((err) =>
              Promise.reject(makeApiError(500, `Password hashing failed: ${err.message}`)))
            .then((password) => [role, status, password]),
          )
          .spread((role, status, password) =>
            // Forge new account

            Account
            .forge({
              ...bodyMaybe,
              password,
              role_id: role.get('id'),
              status_id: status.get('id'),
            })
            .save(null, tmix)
            .then((account) =>
              // TODO enqueue new account registration email

              account)))
      },
    },

    {
      suffix: '/login',
      method: methods.POST,
      role: false,
      schema: { email: schema.email, password: schema.password_login },
      makeResponse({ bodyMaybe }) {
        const { email, password } = bodyMaybe
        return authenticate(email, password)
      },
    },

    {
      method: methods.PATCH,
      role: 'user',
      schema: _.pick(schema, ['email', 'display']),
      makeResponse({ req, idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          Account
          .where('id', idMaybe)
          .fetch({ ...tmix, require: true })
          .catch(catchNotFoundOrConnError())
          .then(makeOwnershipVerifier(req, (r) => r.get('id')))
          .then((account) =>
            account.save(bodyMaybe, tmix)))
      },
    },

    {
      suffix: '/password',
      method: methods.PUT,
      role: 'user',
      schema: _.pick(schema, ['password', 'password_confirmation']),
      prepareBody({ password }) {
        return hash(password)
        .catch((err) =>
          Promise.reject(makeApiError(500, `Password hashing failed: ${err.message}`)))
        // Put hashed password under password key
        .then((passwordHashed) => ({ password: passwordHashed }))
      },
      makeResponse({ req, idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          Account
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['role', 'status'],
          })
          .catch(catchNotFoundOrConnError())
          .then(makeOwnershipVerifier(req, (r) => r.get('id')))
          .then((account) =>
            // Set new hashed password (see prepareBody above)
            account.save(bodyMaybe, tmix)))
      },
    },
  ],
})
