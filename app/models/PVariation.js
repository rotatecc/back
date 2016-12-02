import { bs } from '../db'

// Relationships
import Part from './Part'
import Spec from './Spec'
import BVariation from './BVariation'
import Photo from './Photo'

export default bs.model('PVariation', bs.Model.extend({
  tableName: 'pvariation',
  hasTimestamps: true,

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
