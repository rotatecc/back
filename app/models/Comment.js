import { bs } from '../db'

// related
import Account from './Account'
import Build from './Build'
import Part from './Part'
import Photo from './Photo'

export default bs.model('Comment', bs.Model.extend({
  tableName: 'comment',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  }

  commentable() {
    return this.morphTo('commentable', 'Build', 'Part', 'Photo')
  }
}))
