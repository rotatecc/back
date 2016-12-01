import { bs } from '../db'

// related
// import Part from './Part'
// import PVariation from './PVariation'

export default bs.model('Spec', bs.Model.extend({
  tableName: 'spec',

  parts() {
    return this.manyToMany('Part').withPivot(['value'])
  }

  pvariations() {
    return this.manyToMany('PVariation').withPivot(['value'])
  }
}))
