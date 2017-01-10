import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult } from 'utils'
import { transact } from 'db'

import { Account } from 'models'

import { setAccountStatus } from './accountHelpers'


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
        .query((q) => {
          if (req.query.search) {
            q.where('name', 'LIKE', `%${req.query.search}%`)
          }
        })
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
          require: true,
          withRelated: ['role', 'status'],
        })
      },
    },

    {
      suffix: '/ban',
      method: methods.PUT,
      role: 'super',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          setAccountStatus(idMaybe, true, tmix))
      },
    },

    {
      suffix: '/unban',
      method: methods.PUT,
      role: 'super',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          setAccountStatus(idMaybe, false, tmix))
      },
    },
  ],
})
