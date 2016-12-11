import { bs } from 'db'

// Relationships
import './Account'
import './BTag'
import './BVariation'
import './Comment'

export default bs.model('Build', bs.Model.extend({
  tableName: 'build',
  hasTimestamps: true,

  initialize() {
    this.on('destroying', (build) => {
      // Destroy or detach related

      const removeRelatedPromises = []

      // Detach BTags
      if (!build.related('btags').isEmpty()) {
        removeRelatedPromises.push(build.btags().detach())
      }

      // Destroy BVariations
      if (!build.related('bvariations').isEmpty()) {
        const bvDestroyPromises = build.related('pvariations').map((bv) => bv.destroy())
        removeRelatedPromises.push(Promise.all(bvDestroyPromises))
      }

      // Destroy Comments
      if (!build.related('comments').isEmpty()) {
        const commentDestroyPromises = build.related('comments').map((c) => c.destroy())
        removeRelatedPromises.push(Promise.all(commentDestroyPromises))
      }

      // Wait for all relations to be removed before destroying actual Part
      return Promise.all(removeRelatedPromises)
    })
  },

  account() {
    return this.belongsTo('Account')
  },

  btags() {
    return this.belongsToMany('BTag', 'junction_btag_build')
  },

  bvariations() {
    return this.hasMany('BVariation')
  },

  comments() {
    return this.morphMany('Comment', 'commentable')
  },
}))
