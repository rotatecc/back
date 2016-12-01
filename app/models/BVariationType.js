import { bs } from '../db'

// related
// import BVariation from './BVariation'

export default bs.model('BVariationType', bs.Model.extend({
  tableName: 'bvariationtype',

  bvariations() {
    return this.hasMany('BVariation')
  }
}))
