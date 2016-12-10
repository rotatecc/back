import { bs } from 'db'

// Relationships
import './PType'
import './Brand'
import './Spec'
import './PVariation'
import './Comment'
import './Review'

export default bs.model('Part', bs.Model.extend({
  tableName: 'part',
  hasTimestamps: true,

  initialize() {
    this.on('destroying', (part) => {
      // Destroy or detach related

      const removeRelatedPromises = []

      // Detach Specs
      if (!part.related('specs').isEmpty()) {
        removeRelatedPromises.push(part.specs().detach())
      }

      // Destroy PVariations
      if (!part.related('pvariations').isEmpty()) {
        const pvSpecDetachPromises = []

        // Detach Specs of PVariations first
        part.related('pvariations').each((pv) => {
          if (!pv.related('specs').isEmpty()) {
            pvSpecDetachPromises.push(pv.specs().detach())
          }
        })

        const finalPVariationsPromise = Promise.all(pvSpecDetachPromises)
        .then(() =>
          Promise.all(part.related('pvariations').map((pv) =>
            pv.destroy())))

        removeRelatedPromises.push(finalPVariationsPromise)
      }

      // Destroy Comments
      if (!part.related('comments').isEmpty()) {
        removeRelatedPromises.push(Promise.all(part.related('comments').map((c) => c.destroy())))
      }

      // Destroy Reviews
      if (!part.related('reviews').isEmpty()) {
        removeRelatedPromises.push(Promise.all(part.related('reviews').map((r) => r.destroy())))
      }

      // Wait for all relations to be removed before destroying actual Part
      return Promise.all(removeRelatedPromises)
    })
  },

  ptype() {
    return this.belongsTo('PType')
  },

  brand() {
    return this.belongsTo('Brand')
  },

  specs() {
    return this.belongsToMany('Spec', 'junction_part_spec').withPivot(['value'])
  },

  pvariations() {
    return this.hasMany('PVariation')
  },

  comments() {
    return this.morphMany('Comment', 'commentable')
  },

  reviews() {
    return this.morphMany('Review', 'reviewable')
  },
}))
