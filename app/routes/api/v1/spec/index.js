import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { Spec } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Spec
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
        return Spec
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
          Spec
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b) {
              return Promise.reject(makeApiError(400, 'Spec with name already exists'))
            }

            return null
          })
          .then(() =>
            // Forge new Spec
            Spec
            .forge(bodyMaybe)
            .save(tmix)))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          Spec
          .where({ name: bodyMaybe.name })
          .fetch(tmix)
          .then((b) => {
            if (b && b.get('id') !== idMaybe) {
              return Promise.reject(makeApiError(400, 'Spec with name already exists'))
            }

            return null
          })
          .then(() =>
            Spec
            .where('id', idMaybe)
            .fetch({
              ...tmix,
              require: true,
              withRelated: [],
            }))
          .catch(catchNotFoundOrConnError())
          .then((spec) =>
            spec.save(bodyMaybe, tmix)))
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          Spec
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['parts', 'pvariations'],
          })
          .catch(catchNotFoundOrConnError())
          .then((spec) => {
            if (!spec.related('parts').isEmpty()) {
              return Promise.reject(makeApiError(400, 'Cannot delete, spec has dependent parts'))
            }

            if (!spec.related('pvariations').isEmpty()) {
              return Promise.reject(makeApiError(400, 'Cannot delete, spec has dependent pvariations'))
            }

            return spec
          })
          .then((spec) =>
            spec.destroy({ ...tmix, require: true }))
          .then(() => null))
      },
    },
  ],
})
