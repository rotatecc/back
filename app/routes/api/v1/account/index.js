import { Router } from 'express'
import _ from 'lodash'

import { ApiError, makePromiseHandler, validate, reqWithId, hash } from '../../../../utils'
import queries from './queries'
import schema from './schema'


const r = Router()

r.get('/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return queries.find(parseInt(req.params.id, 10))
  })
}))

r.patch('/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return validate(_.pick(schema, ['email', 'display']), req.body)
  })
  .then((body) => {
    // TODO validate body has at least one field
    return queries.update(parseInt(req.params.id, 10), body)
  })
}))

r.put('/password/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return validate(_.pick(schema, ['password', 'password_confirmation']), req.body)
  })
  .then(({ password }) => {
    return hash(password)
    .catch((err) => {
      return Promise.reject(new ApiError(500, `Password hashing failed: ${err.message}`))
    })
  })
  .then((passwordHashed) => {
    return queries.update(parseInt(req.params.id, 10), {
      password: passwordHashed
    })
  })
}))

export default r
