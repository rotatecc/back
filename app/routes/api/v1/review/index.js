import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { Review } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      suffix: '/moderate',
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Review
        .where('modstatus', 'non')
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: ['reviewable'],
        })
        .then(preparePaginatedResult)
      },
    },

    {
      suffix: '/moderate',
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          Review
          .where('id', idMaybe)
          .fetch(tmix)
          .catch(catchNotFoundOrConnError())
          .then((review) =>
            review.save(bodyMaybe, tmix)))
      },
    },
  ],
})
