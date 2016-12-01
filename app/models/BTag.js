import { bs } from '../db'

// related
// import Build from './Build'

export default bs.model('BTag', bs.Model.extend({
  tableName: 'btag',

  builds() {
    return this.manyToMany('Build')
  }
}))
