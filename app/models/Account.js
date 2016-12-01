import { bs } from '../db'

// Relationships
import Role from './Role'
import Status from './Status'
import Build from './Build'
import Comment from './Comment'
import Photo from './Photo'
import Review from './Review'

export default bs.model('Account', bs.Model.extend({
  tableName: 'account',
  hasTimestamps: true,

  role() {
    return this.belongsTo('Role')
  }

  status() {
    return this.belongsTo('Status')
  }

  builds() {
    return this.hasMany('Build')
  }

  comments() {
    return this.hasMany('Comment')
  }

  photos() {
    return this.hasMany('Photo')
  }

  reviews() {
    return this.hasMany('Review')
  }
}))
