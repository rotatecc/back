import db from '../../../../db'
import config from '../../../../config'
import { ApiError } from '../../../../utils'


export function find(id) {
  return db
    .select('*')
    .from(config.tables.account)
    .where({ id })
    .then((results) => {
      if (results.length === 1) {
        return results[0]
      }

      return Promise.reject(new ApiError(404))
    })
}


export function get(take = 20, skip = 0) {
  // Validate

  if (take < 0 || take >= 100) {
    return Promise.reject(new ApiError(400, 'take param must be between 0 and 100'))
  }

  if (skip < 0) {
    return Promise.reject(new ApiError(400, 'skip param must be greater than 0'))
  }

  // Query

  return db
    .select('*')
    .from(config.tables.account)
    .limit(take)
    .offset(skip)
}


export default {
  find,
  get
}
