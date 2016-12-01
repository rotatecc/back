import { bs } from '../db'

// Relationships
import Build from './Build'

export default bs.model('BTag', bs.Model.extend({
  tableName: 'btag',

  builds() {
    return this.belongsToMany('Build', 'junction_btag_build')
  }
}))
