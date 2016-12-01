import { bs } from '../db'

// related
import Part from './Part'
import Spec from './Spec'
import BVariation from './BVariation'

export default bs.model('PVariation', bs.Model.extend({
  tableName: 'pvariation',
  hasTimestamps: true,

  part() {
    return this.belongsTo('Part')
  }

  specs() {
    return this.belongsToMany('Spec', 'junction_pvariation_spec').withPivot(['value'])
  }

  bvariations() {
    return this.belongsToMany('BVariation', 'junction_bvariation_pvariation')
  }
}))
