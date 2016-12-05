import { bs } from 'db'

// Relationships
import './Account'
import './Build'
import './Part'
import './Photo'

export default bs.model('Comment', bs.Model.extend({
  tableName: 'comment',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  },

  commentable() {
    return this.morphTo('commentable', 'Build', 'Part', 'Photo')
  },
}))
