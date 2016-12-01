import { bs } from '../db'

// related
import Account from './Account'

export default bs.model('Photo', bs.Model.extend({
  tableName: 'photo',

  account() {
    return this.belongsTo('Account')
  }
}))
