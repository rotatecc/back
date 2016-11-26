import knex from 'knex'

import config from './config'
import knexfile from '../knexfile'

export default const db = knex(knexfile[config.env])
