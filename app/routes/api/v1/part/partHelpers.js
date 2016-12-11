import _ from 'lodash'
import Promise from 'bluebird'

import { Brand, PType, PVariation, Spec } from 'models'
import { catchNotFound, makeApiError } from 'utils'


// Verify existence of PType and Brand, throw a 404 ApiError if not
export function verifyDirectPartRelationsExist(body, tmix) {
  const { ptype_id, brand_id } = body

  return Promise.all([
    PType
      .where('id', ptype_id)
      .fetch({ ...tmix, require: true })
      .catch(catchNotFound('PType not found')),
    Brand
      .where('id', brand_id)
      .fetch({ ...tmix, require: true })
      .catch(catchNotFound('Brand not found')),
  ])
  .then(() => null)
}


// For each Spec, either find it by id or create a new one by name
export function findOrCreateSpecs(specs, tmix) {
  // Wrap it all in a Promise. If a single one of the Specs isn't found,
  // or something else bad happens, everything will fail
  return Promise.all(specs.map(({ id, name, value }) => {
    if (id) {
      // Try to find Spec by id
      return Spec
      .where('id', id)
      .fetch({ ...tmix, require: true })
      .catch(catchNotFound(`Spec with id ${id} not found`))
      .then((spec) =>
        ({ spec, value }))
    } else if (name) {
      // Try to find Spec by name (probably no match most of the time)
      return Spec
      .where('name', name)
      .fetch({ ...tmix, require: true })
      .catch(() =>
        // Spec doesn't exist (as expected), so create it
        Spec
        .forge({ name })
        .save(null, tmix))
      .then((spec) =>
        ({ spec, value }))
    }

    // Branch not really reachable due to Joi schema xor validation,
    // but just in case...
    return Promise.reject(makeApiError(400, 'Spec was missing exactly one of [id, name]'))
  }))
}


// Attach or update Specs to a model (probably Part or PVariation), with values for each
export function attachOrUpdateSpecs(model, specCombos, model_key, tmix) {
  const currentSpecIds = model.related('specs').map((spec) => spec.get('id'))

  // Determine which Specs to attach and which to update
  const { toAttach, toUpdate } = _.groupBy(specCombos, (sc) => {
    // If the Spec isn't attached to the model, then mark it to be attached
    if (!currentSpecIds.includes(sc.spec.get('id'))) {
      return 'toAttach'
    }

    const spec = model.related('specs').find((s) =>
      s.get('id') === sc.spec.get('id'))

    // If the Spec value is attached and the value changed, mark it to be updated
    if (spec && spec.get('value') !== sc.value) {
      return 'toUpdate'
    }

    // Pivot value did not change, so it's a no-op
    return 'noop'
  })

  // Do the attaching and updating in parallel
  return Promise.all([
    !toAttach ? Promise.resolve() : model.specs().attach(toAttach.map(({ spec, value }) =>
      ({
        [model_key]: model.get('id'),
        spec_id: spec.get('id'),
        value,
      })), tmix),
    !toUpdate ? Promise.resolve() : Promise.all(toUpdate.map(({ spec, value }) =>
      model.specs().updatePivot(
        { value },
        {
          ...tmix,
          query(qb) {
            qb.where('spec_id', spec.get('id'))
          },
        },
      ))),
  ])
}


// Remove all Specs on a model
export function removeAllSpecs(model, tmix) {
  return model.specs().detach(null, tmix)
}


// Detach Specs from model that are not present in input Specs
export function removeOldSpecs(model, specs, tmix) {
  if (_.isEmpty(specs)) {
    return removeAllSpecs(model, tmix)
  }

  const inputSpecIds = specs
  .map((spec) => spec.id)
  .filter((id) => id)

  const inputSpecNames = specs
  .map((spec) => spec.name)
  .filter((name) => name)

  const toRemove = model.related('specs')
  .filter((spec) =>
    !inputSpecIds.includes(spec.get('id')) && !inputSpecNames.includes(spec.get('name')))

  return model.specs().detach(toRemove, tmix)
}


// Helper to remove old Specs, find/create current/new Specs,
// then attach/update to a model (probably Part or PVariation)
// model_key is the foreign key on the pivot table
// (probably 'part_id' or 'pvariation_id')
export function syncSpecs(model, specs, model_key, tmix) {
  return Promise.resolve() // Blank slate
  .then(() =>
    removeOldSpecs(model, specs, tmix))
  .then(() =>
    findOrCreateSpecs(specs, tmix))
  .then((specCombos) =>
    attachOrUpdateSpecs(model, specCombos, model_key, tmix))
}


// Destroy PVariations from Part that are not present in input PVariations
export function removeOldPVariations(part, pvariations, tmix) {
  const inputPVariationIds = pvariations
  .map((pv) => pv.id)
  .filter((id) => id)

  const toRemove = part.related('pvariations')
  .filter((pv) =>
    !inputPVariationIds.includes(pv.get('id')))

  // Destroy each PVariation
  return Promise.all(toRemove.map((pvariation) => pvariation.destroy(tmix)))
}


// Handle a Part's Specs, PVariations, and Specs of PVariations
export function preparePartDependencies(part, body, tmix) {
  // Sync Specs
  const specsPromise = syncSpecs(part, body.specs, 'part_id', tmix)

  // Create or find each PVariation
  const pvariationsPromise = Promise.resolve() // Blank slate
  .then(() =>
    // Remove old PVariations from Part
    removeOldPVariations(part, body.pvariations, tmix))
  .then(() =>
    // Create or find each, syncing Specs as well
    Promise.all(body.pvariations.map(({ id, specs }) =>
      // Set up an IIFE due to long if statement body
      (() => {
        if (id) {
          // Try to find PVariation by id
          return PVariation
          .where('id', id)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['specs'],
          })
          .catch(catchNotFound(`PVariation with id ${id} not found`))
        }

        // Otherwise, create new PVariation
        return PVariation
        .forge({ part_id: part.get('id') })
        .save(null, tmix)
      })()
      // Sync Specs with this PVariation
      .then((pvariation) =>
        syncSpecs(pvariation, specs, 'pvariation_id', tmix)))))

  return Promise.all([
    specsPromise,
    pvariationsPromise,
  ])
  .then(() => part)
}
