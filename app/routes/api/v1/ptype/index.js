import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

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
        return PType
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b) {
            return Promise.reject(makeApiError(400, 'PType with name already exists'))
          }
        })
        .then(() => {
          // Forge new PType
          return PType
          .forge(bodyMaybe)
          .save()
        })
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return PType
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b && b.get('id') !== idMaybe) {
            return Promise.reject(makeApiError(400, 'PType with name already exists'))
          }
        })
        .then(() => {
          return PType
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: []
          })
        })
        .catch(catchNotFound)
        .then((ptype) => {
          ptype.set(bodyMaybe)
          return ptype.save()
        })
      }
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return PType
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['parts']
        })
        .catch(catchNotFound)
        .then((ptype) => {
          if (!ptype.related('parts').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, ptype has dependent parts'))
          }

          return ptype
        })
        .then((ptype) => {
          return ptype.destroy({ require: true })
        })
        .then((b) => null)
      }
    },
  ]
})
