import { bs } from '../db'

// related
import Account from './Account'
import Part from './Part'

export default bs.model('Review', bs.Model.extend({
  tableName: 'review',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  }

  reviewable() {
    return this.morphTo('reviewable', 'Part')
  }
}))
