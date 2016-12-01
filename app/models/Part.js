import { bs } from '../db'

// related
import PType from './PType'
import Brand from './Brand'
import Spec from './Spec'
import PVariation from './PVariation'

export default bs.model('Part', bs.Model.extend({
  tableName: 'part',
  hasTimestamps: true,

  ptype() {
    return this.belongsTo('PType')
  }

  brand() {
    return this.belongsTo('Brand')
  }

  specs() {
    return this.belongsToMany('Spec').withPivot(['value'])
  }

  pvariations() {
    return this.hasMany('PVariation')
  }
}))
