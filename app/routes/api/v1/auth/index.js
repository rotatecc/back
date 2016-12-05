import _ from 'lodash'
import Promise from 'bluebird'

import makeResource, { methods } from 'resource'
import { authenticate, ApiError, catchNotFound, makeOwnershipVerifier } from 'utils'

import { Account } from 'models'

import schema from '../account/schema'


export default makeResource({
  endpoints: [
    {
      suffix: '/register',
      method: methods.POST,
      role: false,
      schema: _.pick(schema, ['email', 'display', 'password']),
      makeResponse({ bodyMaybe }) {
        // TODO
        // 1) find default role
        // 2) find default status
        // 3) make sure email / display name doesn't already exist

        Account
        .forge(bodyMaybe)
        .save()
        .then((account) => {
          // TODO enqueue new account registration email

          return account
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
          return Promise.reject(new ApiError(500, `Password hashing failed: ${err.message}`))
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
