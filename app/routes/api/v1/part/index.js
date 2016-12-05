import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { Part } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Part
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: ['ptype', 'brand'],
        })
        .then(preparePaginatedResult)
      },
    },

    {
      method: methods.GET,
      getType: 'single',
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Part
        .where({ id: idMaybe })
        .fetch({
          require: true,
          withRelated: ['ptype', 'brand', 'specs', 'pvariations', 'pvariations.specs'],
        })
      },
    },

    {
      method: methods.POST,
      role: 'admin',
      schema,
      makeResponse({ bodyMaybe }) {
        // TODO validate existence of ptype and brand

        // Forge new Part
        return Part
        .forge(bodyMaybe)
        .save()
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        // TODO validate existence of ptype and brand

        return Part
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: []
        })
        .catch(catchNotFound)
        .then((part) => {
          part.set(bodyMaybe)
          return part.save()
        })
      }
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Part
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['specs', 'pvariations', 'comments', 'reviews']
        })
        .catch(catchNotFound)
        .then((part) => {
          // TODO
          // remove the below checks, instead just cascade deletes for each

          if (!part.related('specs').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, part has dependent specs'))
          }

          if (!part.related('pvariations').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, part has dependent pvariations'))
          }

          if (!part.related('comments').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, part has dependent comments'))
          }

          if (!part.related('reviews').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, part has dependent reviews'))
          }

          return part
        })
        .then((part) => {
          return part.destroy({ require: true })
        })
        .then((b) => null)
      }
    },
  ]
})
