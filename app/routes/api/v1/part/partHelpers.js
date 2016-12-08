import { Brand, PType, PVariation, Spec } from 'models'
import { catchNotFound, makeApiError } from 'utils'


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
      .then((spec) =>
        ({ spec, value }))
    } else if (spec_name) {
      // Try to find spec by name (probably no match most of the time)
      return Spec
      .where('name', spec_name)
      .fetch({ require: true })
      .catch(() =>
        // Spec doesn't exist (as expected), so forge it
        Spec
        .forge({ name: spec_name })
        .save())
      .then((spec) =>
        ({ spec, value }))
    }

    // Branch not really reachable due to Joi schema xor validation,
    // but just in case...
    return Promise.reject(makeApiError(400, 'Spec was missing exactly one of [spec_id, spec_name]'))
  }))
}


// Attach Specs to a model (probably Part or PVariation), with values for each
export function attachSpecs(specCombos, model, model_key) {
  return model.specs().attach(specCombos.map(({ spec, value }) =>
    ({
      [model_key]: model.get('id'),
      spec_id: spec.get('id'),
      value,
    })))
}


// Handle a Part's Specs, PVariations, and Specs of PVariations
export function preparePartDependencies(part, body) {
  // Create or find each Spec, then attach all of them to this Part
  const specsAttachPromise = findOrForgeSpecs(body.specs)
  .then((specCombos) =>
    attachSpecs(specCombos, part, 'part_id'))

  // Create or find each PVariation
  const pvariationsPromise = Promise.all(body.pvariations.map(({ pvariation_id, specs }) =>
    (() => {
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
    .then((pvariation) =>
      findOrForgeSpecs(specs)
      .then((specCombos) =>
        attachSpecs(specCombos, pvariation, 'pvariation_id')))))

  return Promise.all([
    specsAttachPromise,
    pvariationsPromise,
  ])
  .then(() => part)
}
