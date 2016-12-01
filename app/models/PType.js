import { bs } from '../db'

// related
// import Part from './Part'

export default bs.model('PType', bs.Model.extend({
  tableName: 'ptype',

  parts() {
    return this.hasMany('Part')
  }
}))
