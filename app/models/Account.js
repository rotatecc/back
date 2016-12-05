import { bs } from 'db'

// Relationships
import './Role'
import './Status'
import './Build'
import './Comment'
import './Photo'
import './Review'

export default bs.model('Account', bs.Model.extend({
  tableName: 'account',
  hasTimestamps: true,
  hidden: ['password'],

  role() {
    return this.belongsTo('Role')
  },

  status() {
    return this.belongsTo('Status')
  },

  builds() {
    return this.hasMany('Build')
  },

  comments() {
    return this.hasMany('Comment')
  },

  photos() {
    return this.hasMany('Photo')
  },

  reviews() {
    return this.hasMany('Review')
  },
}))
