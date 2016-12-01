import { bs } from '../db'

// related
import Account from './Account'

export default bs.model('Review', bs.Model.extend({
  tableName: 'review',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  }
}))
