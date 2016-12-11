import Promise from 'bluebird'

import { BVariation, BTag, BVariationType, PVariation } from 'models'
import { catchNotFound } from 'utils'


export function removeOldBVariations(build, bvariations, tmix) {
  const inputBVIds = bvariations
  .map((bv) => bv.id)
  .filter((id) => id)

  const toRemove = build.related('bvariations')
  .filter((bv) =>
    !inputBVIds.includes(bv.get('id')))

  // Destroy old BVs
  return Promise.all(toRemove.map((bv) => bv.destroy(tmix)))
}


export function syncBTags(build, btagIds, tmix) {
  // Get current Build's BTag ids
  const currentBTagIds = build.related('btags')
  .map((b) => b.get('id'))

  const toDetach = currentBTagIds
  .filter((id) => !btagIds.includes(id))

  const toAttach = btagIds
  .filter((id) => !currentBTagIds.includes(id))

  // Make sure all the BTags to be attached exist
  return Promise.all(toAttach.map((id) =>
    BTag.where('id', id)
    .fetch({ ...tmix, require: true })
    .catch(catchNotFound(`BTag with id ${id} not found`))))
  .then(() =>
    Promise.all([
      build.btags().detach(toDetach, tmix),
      build.btags().attach(toAttach, tmix),
    ]))
}


export function syncPVariations(bvariation, pvariationIds, tmix) {
  // Get current BVariation's PVariation ids
  const currentPVIds = bvariation.related('pvariations')
  .map((pv) => pv.get('id'))

  const toDetach = currentPVIds
  .filter((id) => !pvariationIds.includes(id))

  const toAttach = pvariationIds
  .filter((id) => !currentPVIds.includes(id))

  // Make sure all the PVariations to be attached exist
  return Promise.all(toAttach.map((id) =>
    PVariation.where('id', id)
    .fetch({ ...tmix, require: true })
    .catch(catchNotFound(`PVariation with id ${id} not found`))))
  .then(() =>
    Promise.all([
      bvariation.pvariations().detach(toDetach, tmix),
      bvariation.pvariations().attach(toAttach, tmix),
    ]))
}


// Handle a Build's BTags and BVariations
// (including BV.BVariationType and BV.PVariations)
export function prepareBuildDependencies(build, body, tmix) {
  // Sync BTags
  const btagsPromise = syncBTags(build, body.btags, tmix)

  // Create or find each BVariation
  const bvariationsPromise = Promise.resolve() // Blank slate
  .then(() =>
    // Remove old BVariations from Build
    removeOldBVariations(build, body.bvariations, tmix))
  .then(() =>
    // Create or find each, syncing PVariations and BVariationType as well
    Promise.all(body.bvariations.map(({ id, name, bvariationtype_id, pvariations }, order) =>
      // Find BVariationType
      BVariationType
      .where('id', bvariationtype_id)
      .fetch(tmix)
      .catch(catchNotFound(`BVariationType with id ${bvariationtype_id} not found`))
      // Find or create BVariation
      .then((bvariationtype) => {
        const fields = {
          name,
          order,
          bvariationtype_id: bvariationtype.get('id'),
        }

        if (id) {
          // Try to find PVariation by id, then save the direct fields
          return BVariation
          .where('id', id)
          .fetch({
            ...tmix,
            require: true,
            withRelated: ['pvariations'], // We'll load the BVariationType later
          })
          .catch(catchNotFound(`BVariation with id ${id} not found`))
          .then((bv) =>
            bv.save(fields, tmix))
          .then((bv) =>
            bv.load('bvariationtype', tmix))
        }

        // Otherwise, create new BVariation
        return BVariation
        .forge(fields)
        .save(null, tmix)
        .then((bv) =>
          bv.load('bvariationtype', tmix))
      })
      // Sync PVariations with this BVariation
      .then((bvariation) =>
        syncPVariations(bvariation, pvariations, tmix)))))

  return Promise.all([
    btagsPromise,
    bvariationsPromise,
  ])
  .then(() => build)
}
