import { bs } from 'db'

// Relationships
import './Account'

export default bs.model('Role', bs.Model.extend({
  tableName: 'role',

  accounts() {
    return this.hasMany('Account')
  },
}))
