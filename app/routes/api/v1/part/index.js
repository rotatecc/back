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
        return verifyDirectPartRelationsExist(bodyMaybe)
        .then(() => {
          // Forge new part
          return Part
          .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
          .save()
        })
        .then((part) => {
          return preparePartDependencies(part, bodyMaybe)
        })
        .then((part) => {
          // Everything went well,
          // so just return the new part with fresh-loaded relations
          return part.load(['specs', 'pvariations', 'pvariations.specs'])
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


// Verify existence of PType and Brand
export function verifyDirectPartRelationsExist(body) {
  const { ptype_id, brand_id } = body

  return Promise.all([
    PType
      .where('id', ptype_id)
      .fetch({ require: true })
      .catch(catchNotFound('PType not found')),
    Brand
      .where('id', brand_id)
      .fetch({ require: true })
      .catch(catchNotFound('Brand not found')),
  ])
  .then(() => null)
}


// For each spec, either find it by id or create a new one by name
// Wrap it all in a Promise. If a single one of the specs isn't found,
// or something else bad happens, everything will fail
export function findOrForgeSpecs(specs) {
  return Promise.all(specs.map(({ spec_id, spec_name, value }) => {
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
        // Spec doesn't exist (as expected), so forge it
        return Spec
        .forge({ name: spec_name })
        .save()
      })
      .then((spec) => {
        return { spec, value }
      })
    }

    // Branch not really reachable due to Joi schema xor validation,
    // but just in case...
    return Promise.reject(new ApiError(400, 'Spec was missing exactly one of [spec_id, spec_name]'))
  }))
}


// Attach Specs to a model (probably Part or PVariation), with values for each
export function attachSpecs(specCombos, model, model_key) {
  return model.specs().attach(specCombos.map(({ spec, value }) => {
    return {
      [model_key]: model.get('id'),
      spec_id: spec.get('id'),
      value
    }
  }))
}


// Handle a Part's Specs, PVariations, and Specs of PVariations
export function preparePartDependencies(part, body) {
  // Create or find each Spec, then attach all of them to this Part
  const specsAttachPromise = findOrForgeSpecs(body.specs)
  .then((specCombos) => {
    return attachSpecs(specCombos, part, 'part_id')
  })

  // Create or find each PVariation
  const pvariationsPromise = Promise.all(body.pvariations.map(({ pvariation_id, specs }) => {
    return (() => {
      if (pvariation_id) {
        // Try to find PVariation by id
        return PVariation
        .where('id', pvariation_id)
        .fetch({ require: true })
        .catch(catchNotFound(`PVariation with id ${pvariation_id} not found`))
      }

      // Otherwise, create new PVariation
      return PVariation
      .forge({ part_id: part.get('id') })
      .save()
    })()
    // Create or find each Spec, then attach all of them to this PVariation
    .then((pvariation) => {
      return findOrForgeSpecs(specs)
      .then((specCombos) => {
        return attachSpecs(specCombos, pvariation, 'pvariation_id')
      })
    })
  }))

  return Promise.all([
    specsAttachPromise,
    pvariationsPromise
  ])
  .then(() => part)
}
