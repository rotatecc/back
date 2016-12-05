import _ from 'lodash'
import Promise from 'bluebird'

import config from 'config'
import makeResource, { methods } from 'resource'
import { ApiError, hash, preparePaginatedResult, catchNotFound, makeOwnershipVerifier } from 'utils'

import { Account } from 'models'

import schema from './schema'


// NOTE
// Endpoints under /account are only for super-admins.
// For a user's own endpoints, see /auth


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'single',
      role: 'super',
      makeResponse({ idMaybe }) {
        return Account
        .where({ id: idMaybe })
        .fetch({
          withRelated: ['role', 'status'],
          require: true,
        })
      },
    },

    {
      method: methods.GET,
      getType: 'paginate',
      role: 'super',
      makeResponse({ req }) {
        return Account
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: ['role', 'status'],
        })
        .then(preparePaginatedResult)
      },
    },

    {
      method: methods.PATCH,
      role: 'super',
      schema: _.pick(schema, ['email', 'display']),
      makeResponse({ idMaybe, bodyMaybe }) {
        return Account
        .where('id', idMaybe)
        .fetch({ require: true })
        .catch(catchNotFound)
        .then((account) => {
          account.set(bodyMaybe)
          return account.save()
        })
      },
    },

    {
      suffix: '/password',
      method: methods.PUT,
      role: 'super',
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
        .then((account) => {
          // set new hashed password (see prepareBody above)
          account.set(bodyMaybe)
          return account.save()
        })
      },
    },
  ]
})
