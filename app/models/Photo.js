import { bs } from 'db'

// Relationships
import './Account'
import './BVariation'
import './PVariation'
import './Comment'

export default bs.model('Photo', bs.Model.extend({
  tableName: 'photo',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  },

  photoable() {
    return this.morphTo('photoable', 'BVariation', 'PVariation')
  },

  comments() {
    return this.morphMany('Comment', 'commentable')
  },
}))
