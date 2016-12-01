import { bs } from '../db'

// related
import Account from './Account'

export default bs.model('Role', bs.Model.extend({
  tableName: 'role',

  accounts() {
    return this.hasMany('Account');
  }
}))
