import { bs } from '../db'

// related
import Role from './Role'

export default bs.model('Account', bs.Model.extend({
  tableName: 'account',
  hasTimestamps: true,

  role() {
    return this.belongsTo('Role')
  }

  status() {
    return this.belongsTo('Status')
  }
}))
