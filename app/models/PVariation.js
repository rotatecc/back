import { bs } from 'db'

// Relationships
import './Part'
import './Spec'
import './BVariation'
import './Photo'

export default bs.model('PVariation', bs.Model.extend({
  tableName: 'pvariation',
  hasTimestamps: true,

  initialize() {
    this.on('destroying', (pvariation) => {
      const relationRemovalPromises = []

      // Remove Specs from pivot
      if (!pvariation.related('specs').isEmpty()) {
        relationRemovalPromises.push(pvariation.specs().detach())
      }

      // Destroy Photos
      if (!pvariation.related('photos').isEmpty()) {
        relationRemovalPromises.push(Promise.all(pvariation.related('photos').map((p) => p.destroy())))
      }

      return Promise.all(relationRemovalPromises)
    })
  },

  part() {
    return this.belongsTo('Part')
  },

  specs() {
    return this.belongsToMany('Spec', 'junction_pvariation_spec').withPivot(['value'])
  },

  bvariations() {
    return this.belongsToMany('BVariation', 'junction_bvariation_pvariation')
  },

  photos() {
    return this.morphMany('Photo', 'photoable')
  },
}))
