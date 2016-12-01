import { bs } from '../db'

// Relationships
import PType from './PType'
import Brand from './Brand'
import Spec from './Spec'
import PVariation from './PVariation'
import Comment from './Comment'
import Review from './Review'

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
    return this.belongsToMany('Spec', 'junction_part_spec').withPivot(['value'])
  }

  pvariations() {
    return this.hasMany('PVariation')
  }

  comments() {
    return this.morphMany('Comment', 'commentable')
  }

  reviews() {
    return this.morphMany('Review', 'reviewable')
  }
}))
