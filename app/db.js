import knex from 'knex'

import config from './config'
import knexfile from '../knexfile'

export default knex(knexfile[config.env])
