import { bs } from '../db'

// Relationships
import BVariationType from './BVariationType'
import Build from './Build'
import PVariation from './PVariation'
import Photo from './Photo'

export default bs.model('BVariation', bs.Model.extend({
  tableName: 'bvariation',
  hasTimestamps: true,

  bvariationtype() {
    return this.belongsTo('BVariationType')
  }

  build() {
    return this.belongsTo('Build')
  }

  pvariations() {
    return this.belongsToMany('PVariation', 'junction_bvariation_pvariation')
  }

  photos() {
    return this.morphMany('Photo', 'photoable')
  }
}))
