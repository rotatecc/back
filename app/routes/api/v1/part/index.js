import _ from 'lodash'
import Promise from 'bluebird'

import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { Part, PType, Brand, Spec, PVariation } from 'models'

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
        return preparePartDependencies(bodyMaybe)
        .spread((specCombos, pvariationCombos) => {
          // Forge new part
          return Part
          .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
          .save()
          .then((part) => ([specCombos, pvariationCombos, part]))
        })
        .spread((specCombos, pvariationCombos, part) => {
          return Promise.all([
            // Attach specs to part, with values
            part.specs().attach(specCombos.map(({ spec, value }) => {
              return {
                part_id: part.get('id'),
                spec_id: spec.get('id'),
                value
              }
            })),
            // Attach pvariations to part, with values
            // TODO
          ])
          .then(() => {
            // Assuming everything went well, just return the new part
            // TODO load new relations
            return part.load(['specs', 'pvariations'])
          })
        })
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


export function preparePartDependencies(body) {
  // verify existence of ptype and brand
  return Promise.all([
    PType
      .where('id', body.ptype_id)
      .fetch({ require: true })
      .catch(catchNotFound('PType not found')),
    Brand
      .where('id', body.brand_id)
      .fetch({ require: true })
      .catch(catchNotFound('Brand not found')),
  ])
  .then(() => {
    // For each spec, either find it by id or create a new one by name
    // Wrap it all in a Promise. If a single spec isn't found, or something
    // else bad happens, everything will fail
    const specComboPromises = Promise.all(body.specs.map(({ spec_id, spec_name, value }) => {
      if (spec_id) {
        // Try to find spec by id
        return Spec
        .where('id', spec_id)
        .fetch({ require: true })
        .catch(catchNotFound(`Spec with id ${spec_id} not found`))
        .then((spec) => {
          return { spec, value }
        })
      } else if (spec_name) {
        // Try to find spec by name (probably no match most of the time)
        return Spec
        .where('name', spec_name)
        .fetch({ require: true })
        .catch(() => {
          // Spec doesn't exist (as expected), so make it
          return Spec
          .forge({ name: spec_name })
          .save()
        })
        .then((spec) => {
          return { spec, value }
        })
      }

      // Branch not really reachable due to Joi schema xor validation
      return Promise.reject(new ApiError(400, 'Spec was missing exactly one of [spec_id, spec_name] key'))
    }))

    // Do simliar for PVariations
    const pvariationComboPromises = Promise.all(body.pvariations.map(({ pvariation_id, specs }) => {
      if (pvariation_id) {
        // Try to find PVariation by id
        return PVariation
        .where('id', pvariation_id)
        .fetch({ require: true })
        .catch(catchNotFound(`PVariation with id ${pvariation_id} not found`))
        .then((pvariation) => {
          return { pvariation, specs }
        })
      }

      // Create new PVariation
      return PVariation
      .forge({})
      .save()
      .then((pvariation) => {
        // TODO find or create each spec

        return { pvariation, specs }
      })
    }))

    return Promise.all([specComboPromises, pvariationComboPromises])
  })
}
