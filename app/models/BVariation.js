import { bs } from 'db'

// Relationships
import './BVariationType'
import './Build'
import './PVariation'
import './Photo'

export default bs.model('BVariation', bs.Model.extend({
  tableName: 'bvariation',
  hasTimestamps: true,

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
