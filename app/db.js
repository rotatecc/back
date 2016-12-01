import knex from 'knex'
import bookshelf from 'bookshelf'

import config from './config'
import knexfile from '../knexfile'

export const kx = knex(knexfile[config.env])

export const bs = bookshelf(kx)
bs.plugin('registry')
