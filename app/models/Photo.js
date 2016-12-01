import { bs } from '../db'

// related
import Account from './Account'
import BVariation from './BVariation'
import PVariation from './PVariation'
import Comment from './Comment'

export default bs.model('Photo', bs.Model.extend({
  tableName: 'photo',
  hasTimestamps: true,

  account() {
    return this.belongsTo('Account')
  }

  photoable() {
    return this.morphTo('photoable', 'BVariation', 'PVariation')
  }

  comments() {
    return this.morphMany('Comment', 'commentable');
  }
}))
