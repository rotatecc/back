import { bs } from 'db'

// Relationships
import './Part'
import './Spec'
import './BVariation'
import './Photo'

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
