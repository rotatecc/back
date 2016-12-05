import _ from 'lodash'
import Promise from 'bluebird'

import config from 'config'
import makeResource, { methods } from 'resource'
import { ApiError, hash, preparePaginatedResult, catchNotFound, makeOwnershipVerifier } from 'utils'

import { Account, Status } from 'models'

import schema from './schema'


// NOTE
// Endpoints under /account are only for super-admins.
// For a user's own endpoints, see /auth


export default makeResource({
  endpoints: [
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
      suffix: '/ban',
      method: methods.PUT,
      role: 'super',
      makeResponse({ idMaybe }) {
        // see below
        return setAccountStatus(idMaybe, true)
      }
    },

    {
      suffix: '/unban',
      method: methods.PUT,
      role: 'super',
      makeResponse({ idMaybe }) {
        // see below
        return setAccountStatus(idMaybe, false)
      }
    }
  ]
})


export function setAccountStatus(userId, isBanned) {
  return Promise.all([
    Status.where('slug', isBanned ? 'banned' : 'okay').fetch({ require: true }),
    Account
    .where({ id: userId })
    .fetch({
      withRelated: ['role', 'status'],
      require: true
    })
  ])
  .catch(catchNotFound)
  .spread((status, account) => {
    if (account.related('role').get('slug') === 'super') {
      return Promise.reject(new ApiError(400, 'Cannot set status of super-admin'))
    }

    account.set('status_id', status.get('id'))
    return account.save().then(() => null)
  })
}
