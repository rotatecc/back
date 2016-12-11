import { bs } from 'db'

// Relationships
import './BVariationType'
import './Build'
import './PVariation'
import './Photo'

export default bs.model('BVariation', bs.Model.extend({
  tableName: 'bvariation',
  hasTimestamps: true,

  initialize() {
    this.on('destroying', (bv) => {
      // Destroy or detach related

      const removeRelatedPromises = []

      // Detach BVariations
      removeRelatedPromises.push(bv.pvariations().detach())

      // Destroy Photos
      if (!bv.related('photos').isEmpty()) {
        const photoDestroyPromises = bv.related('photos').map((p) => p.destroy())
        removeRelatedPromises.push(Promise.all(photoDestroyPromises))
      }

      // Wait for all relations to be removed before destroying actual BVariation
      return Promise.all(removeRelatedPromises)
    })
  },

  bvariationtype() {
    return this.belongsTo('BVariationType')
  },

  build() {
    return this.belongsTo('Build')
  },

  pvariations() {
    return this.belongsToMany('PVariation', 'junction_bvariation_pvariation')
  },

  photos() {
    return this.morphMany('Photo', 'photoable')
  },
}))
