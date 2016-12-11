import knex from 'knex'
import bookshelf from 'bookshelf'

import config from './config'
import knexfile from '../knexfile'


export const kx = knex(knexfile[config.env])


export const bs = bookshelf(kx)
bs.plugin('registry') // Circumvent circular dependencies
bs.plugin('pagination') // Allow fetchPage + some nice response metadata
bs.plugin('visibility') // Hide/show for toJSON


// Transaction helper, since t is always used in an object
// under the transacting key, create that partial object
// to be used as a mixin (known as 'tmix' elsewhere)
export function transact(container) {
  return bs.transaction((transacting) => container({ transacting }))
}
