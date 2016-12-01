import { bs } from '../db'

// related
import Account from './Account'
import BTag from './BTag'
import BVariation from './BVariation'

export default bs.model('Build', bs.Model.extend({
  tableName: 'build',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  }

  btags() {
    return this.belongsToMany('BTag')
  }

  bvariations() {
    return this.hasMany('BVariation')
  }
}))
