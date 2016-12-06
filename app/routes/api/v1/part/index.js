import _ from 'lodash'
import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { Part, PType, Brand } from 'models'

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
        // verify existence of ptype and brand
        return Promise.all([
          PType
            .where({ id: bodyMaybe.ptype_id })
            .fetch({ require: true })
            .catch(catchNotFound('PType not found')),
          Brand
            .where({ id: bodyMaybe.brand_id })
            .fetch({ require: true })
            .catch(catchNotFound('Brand not found')),
        ])
        .then(() => {
          // Forge new Part
          return Part
          .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
          .save()
        })
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        // verify existence of ptype and brand
        return Promise.all([
          PType.where({ id: bodyMaybe.ptype_id }).fetch({ require: true }),
          Brand.where({ id: bodyMaybe.brand_id }).fetch({ require: true }),
        ])
        .then(() => {
          // find part
          return Part
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: []
          })
        })
        .catch(catchNotFound())
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
        .catch(catchNotFound())
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
