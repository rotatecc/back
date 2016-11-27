import db from '../../../../db'
import config from '../../../../config'
import { ApiError, makeSingleOrReject, hash } from '../../../../utils'


export function create(fields) {
  return hash(fields.password)
    .catch((err) => {
      return Promise.reject(new Error(500, `Password hashing failed: ${err.message}`))
    })
    .then((passwordHashed) => {
      const finalFields = Object.assign({}, fields, {
        password: passwordHashed
      })

      return db(config.tables.account)
        .returning('id')
        .insert(finalFields)
    })
}


export function find(id) {
  return db
    .select('*')
    .from(config.tables.account)
    .where({ id })
    .then(makeSingleOrReject)
}


export function update(id, fields) {
  return db(config.tables.account)
    .where('id', id)
    .update(fields)
}


export function updateRole(id, roleId) {
  // TODO
}


export function updateStatus(id, isBanned) {
  return db(config.tables.account)
    .where('id', id)
    .update({
      status: isBanned ? true : false
    })
}


export function get(take = 20, skip = 0) {
  // Validate

  if (take < 0 || take >= 100) {
    return Promise.reject(new ApiError(400, 'Take param must be between 0 and 100 (exclusive)'))
  }

  if (skip < 0) {
    return Promise.reject(new ApiError(400, 'Skip param must be greater than 0'))
  }

  // Query

  return db
    .select('*')
    .from(config.tables.account)
    .limit(take)
    .offset(skip)
}


export default {
  create,
  find,
  update,
  updateRole,
  updateStatus,
  get
}
