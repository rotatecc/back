import { bs } from 'db'

// Relationships
import './Part'

export default bs.model('Brand', bs.Model.extend({
  tableName: 'brand',
  hasTimestamps: true,

  parts() {
    return this.hasMany('Part')
  },
}))
