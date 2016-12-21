import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { BTag } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return BTag
        .query((q) => {
          if (req.query.search) {
            q.where('name', 'LIKE', `%${req.query.search}%`)
          }
        })
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: [],
        })
        .then(preparePaginatedResult)
      },
    },

    {
      method: methods.GET,
      getType: 'single',
      role: 'admin',
      makeResponse({ idMaybe }) {
        return BTag
        .where({ id: idMaybe })
        .fetch({
          require: true,
          withRelated: [],
        })
      },
    },

    {
      method: methods.POST,
      role: 'admin',
      schema,
      makeResponse({ bodyMaybe }) {
        return transact((tmix) =>
          BTag
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b) {
              return Promise.reject(makeApiError(400, 'BTag with name already exists'))
            }

            return null
          })
          .then(() =>
            // Forge new BTag
            BTag
            .forge(bodyMaybe)
            .save(null, tmix)))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          BTag
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b && b.get('id') !== idMaybe) {
              return Promise.reject(makeApiError(400, 'BTag with name already exists'))
            }

            return null
          })
          .then(() =>
            BTag
            .where('id', idMaybe)
            .fetch({
              ...tmix,
              require: true,
              withRelated: [],
            }))
          .catch(catchNotFoundOrConnError())
          .then((btag) =>
            btag.save(bodyMaybe, tmix)))
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          BTag
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['builds'],
          })
          .catch(catchNotFoundOrConnError())
          .then((btag) => {
            if (!btag.related('builds').isEmpty()) {
              return Promise.reject(makeApiError(400, 'Cannot delete, btag has dependent builds'))
            }

            return btag
          })
          .then((btag) =>
            btag.destroy({ ...tmix, require: true }))
          .then(() => null))
      },
    },
  ],
})
