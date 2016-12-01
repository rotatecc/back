import { bs } from '../db'

// related
import Account from './Account'

export default bs.model('Comment', bs.Model.extend({
  tableName: 'comment',

  account() {
    return this.belongsTo('Account')
  }
}))
