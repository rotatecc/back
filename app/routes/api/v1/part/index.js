import _ from 'lodash'
import Promise from 'bluebird'

import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { Part, PType, Brand } from 'models'

import schema from './schema'
import { verifyDirectPartRelationsExist, preparePartDependencies } from './partHelpers'


const standardRelated = [
  'ptype',
  'brand',
  'specs',
  'pvariations',
  'pvariations.specs',
]


const standardRelatedAll = [
  ...standardRelated,
  'comments',
  'reviews',
]


const standardRelatedCompact = [
  'ptype',
  'brand',
]


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
          withRelated: standardRelatedCompact,
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
          withRelated: standardRelated,
        })
      },
    },

    {
      method: methods.POST,
      role: 'admin',
      schema,
      makeResponse({ bodyMaybe }) {
        return verifyDirectPartRelationsExist(bodyMaybe)
        .then(() =>
          // Forge new part
          Part
          .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
          .save())
        .then((part) =>
          preparePartDependencies(part, bodyMaybe))
        .then((part) =>
          // Everything went well,
          // so just return the new part with fresh-loaded relations
          part.load(standardRelated))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        // verify existence of PType, Brand, and Part
        return Promise.all([
          PType
            .where('id', bodyMaybe.ptype_id)
            .fetch({ require: true })
            .catch(catchNotFound('PType not found')),
          Brand
            .where('id', bodyMaybe.brand_id)
            .fetch({ require: true })
            .catch(catchNotFound('Brand not found')),
          Part
            .where('id', idMaybe)
            .fetch({ require: true })
            .catch(catchNotFound('Part not found')),
        ])
        .spread((ptype, brand, part) => {
          part.set(_.omit(bodyMaybe, ['specs', 'pvariations']))
          return part.save()
        })
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Part
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: standardRelatedAll,
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
        .then((part) =>
          part.destroy({ require: true }))
        .then(() => null)
      },
    },
  ],
})
