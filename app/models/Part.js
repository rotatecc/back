import { bs } from 'db'

// Relationships
import './PType'
import './Brand'
import './Spec'
import './PVariation'
import './Comment'
import './Review'

export default bs.model('Part', bs.Model.extend({
  tableName: 'part',
  hasTimestamps: true,

  ptype() {
    return this.belongsTo('PType')
  },

  brand() {
    return this.belongsTo('Brand')
  },

  specs() {
    return this.belongsToMany('Spec', 'junction_part_spec').withPivot(['value'])
  },

  pvariations() {
    return this.hasMany('PVariation')
  },

  comments() {
    return this.morphMany('Comment', 'commentable')
  },

  reviews() {
    return this.morphMany('Review', 'reviewable')
  },
}))
