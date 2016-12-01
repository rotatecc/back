import { bs } from '../db'

// related
import Part from './Part'

export default bs.model('Brand', bs.Model.extend({
  tableName: 'brand',
  hasTimestamps: true,

  parts() {
    return this.hasMany('Part')
  }
}))
