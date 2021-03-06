import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { Photo } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      suffix: '/moderate',
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Photo
        .where('modstatus', 'non')
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: ['photoable'],
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
          Photo
          .where('id', idMaybe)
          .fetch(tmix)
          .catch(catchNotFoundOrConnError())
          .then((photo) =>
            photo.save(bodyMaybe, tmix)))
      },
    },
  ],
})
