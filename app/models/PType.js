import { bs } from 'db'

// Relationships
import './Part'

export default bs.model('PType', bs.Model.extend({
  tableName: 'ptype',

  parts() {
    return this.hasMany('Part')
  },
}))
