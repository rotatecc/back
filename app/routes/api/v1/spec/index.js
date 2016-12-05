import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

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
        return Spec
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b) {
            return Promise.reject(makeApiError(400, 'Spec with name already exists'))
          }
        })
        .then(() => {
          // Forge new Spec
          return Spec
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
        return Spec
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b && b.get('id') !== idMaybe) {
            return Promise.reject(makeApiError(400, 'Spec with name already exists'))
          }
        })
        .then(() => {
          return Spec
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: []
          })
        })
        .catch(catchNotFound)
        .then((spec) => {
          spec.set(bodyMaybe)
          return spec.save()
        })
      }
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Spec
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['parts', 'pvariations']
        })
        .catch(catchNotFound)
        .then((spec) => {
          if (!spec.related('parts').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, spec has dependent parts'))
          }

          if (!spec.related('pvariations').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, spec has dependent pvariations'))
          }

          return spec
        })
        .then((spec) => {
          return spec.destroy({ require: true })
        })
        .then((b) => null)
      }
    },
  ]
})
