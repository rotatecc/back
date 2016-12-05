import { bs } from 'db'

// Relationships
import './Account'

export default bs.model('Status', bs.Model.extend({
  tableName: 'status',

  accounts() {
    return this.hasMany('Account')
  },
}))
