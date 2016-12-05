import { bs } from 'db'

// Relationships
import './Account'
import './BTag'
import './BVariation'
import './Comment'

export default bs.model('Build', bs.Model.extend({
  tableName: 'build',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  },

  btags() {
    return this.belongsToMany('BTag', 'junction_btag_build')
  },

  bvariations() {
    return this.hasMany('BVariation')
  },

  comments() {
    return this.morphMany('Comment', 'commentable')
  },
}))
