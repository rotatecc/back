import { bs } from '../db'

// related
import Part from './Part'
import PVariation from './PVariation'

export default bs.model('Spec', bs.Model.extend({
  tableName: 'spec',

  parts() {
    return this.belongsToMany('Part', 'junction_part_spec').withPivot(['value'])
  }

  pvariations() {
    return this.belongsToMany('PVariation', 'junction_pvariation_spec').withPivot(['value'])
  }
}))
