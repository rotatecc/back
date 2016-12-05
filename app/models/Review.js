import { bs } from 'db'

// Relationships
import './Account'
import './Part'

export default bs.model('Review', bs.Model.extend({
  tableName: 'review',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  },

  reviewable() {
    return this.morphTo('reviewable', 'Part')
  },
}))
