import { bs } from '../db'

// related
import BVariationType from './BVariationType'
import Build from './Build'
import PVariation from './PVariation'

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
}))
