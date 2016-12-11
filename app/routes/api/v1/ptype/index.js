import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'
import { bs } from 'db'

import { PType } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return PType
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
        return PType
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
        return bs.transaction((t) => {
          const tmix = { transacting: t }

          return PType
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b) {
              return Promise.reject(makeApiError(400, 'PType with name already exists'))
            }

            return null
          })
          .then(() =>
            // Forge new PType
            PType
            .forge(bodyMaybe)
            .save(null, tmix))
        })
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return bs.transaction((t) => {
          const tmix = { transacting: t }

          return PType
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b && b.get('id') !== idMaybe) {
              return Promise.reject(makeApiError(400, 'PType with name already exists'))
            }

            return null
          })
          .then(() =>
            PType
            .where('id', idMaybe)
            .fetch({
              ...tmix,
              require: true,
              withRelated: [],
            }))
          .catch(catchNotFound())
          .then((ptype) =>
            ptype.save(bodyMaybe, tmix))
        })
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return bs.transaction((t) => {
          const tmix = { transacting: t }

          return PType
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['parts'],
          })
          .catch(catchNotFound())
          .then((ptype) => {
            if (!ptype.related('parts').isEmpty()) {
              return Promise.reject(makeApiError(400, 'Cannot delete, PType has dependent Parts'))
            }

            return ptype
          })
          .then((ptype) =>
            ptype.destroy({
              ...tmix,
              require: true,
            }))
          .then(() => null)
        })
      },
    },
  ],
})
