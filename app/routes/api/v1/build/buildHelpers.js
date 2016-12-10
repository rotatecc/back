import Promise from 'bluebird'

import { BVariation, PVariation, BVariationType } from 'models'
import { catchNotFound } from 'utils'


export function removeOldBVariations(build, bvariations) {
  // TODO
}


export function syncBTags(build, btags) {
  // TODO
}


export function syncPVariations(build, pvariations) {
  // TODO
}


// Handle a Build's BTags and BVariations
// (including BV.BVariationType and BV.PVariations)
export function prepareBuildDependencies(build, body) {
  // Sync BTags
  const btagsPromise = syncBTags(build, body.btags)

  // Create or find each BVariation
  const bvariationsPromise = Promise.resolve() // Blank slate
  .then(() =>
    // Remove old BVariations from Build
    removeOldBVariations(build, body.bvariations))
  .then(() =>
    // Create or find each, syncing PVariations and BVariationType as well
    Promise.all(body.bvariations.map(({ id, name, bvariationtype_id, pvariations }, order) =>
      // Find BVariationType
      BVariationType.where('id', bvariationtype_id)
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
            require: true,
            withRelated: ['pvariations'],
          })
          .catch(catchNotFound(`BVariation with id ${id} not found`))
          .then((bvariation) =>
            bvariation.set(fields).save().load('bvariationtype'))
        }

        // Otherwise, create new BVariation
        return BVariation
        .forge(fields)
        .save()
        .load('bvariationtype')
      })
      // Sync PVariations with this BVariation
      .then((bvariation) =>
        syncPVariations(bvariation, pvariations)))))

  return Promise.all([
    btagsPromise,
    bvariationsPromise,
  ])
  .then(() => build)
}
