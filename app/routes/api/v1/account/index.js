import { Router } from 'express'
import Joi from 'joi'

import { ApiError, makePromiseHandler, validate, reqWithId, hash } from '../../../../utils'
import queries from './queries'


const r = Router()

r.get('/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return queries.find(parseInt(req.params.id, 10))
  })
}))

r.put('/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return validate({
      email: Joi.string().email(),
      display: Joi.string().trim().min(3)
    }, req.body)
  })
  .then((body) => {
    // TODO validate body has at least one field
    return queries.update(parseInt(req.params.id, 10), body)
  })
}))

r.put('/password/:id', makePromiseHandler((req) => {
  return reqWithId(req)
  .then(() => {
    return validate({
      password: Joi.string().min(7).required(),
      password_confirmation: Joi.any().strip().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'Passwords must match' } } })
    }, req.body)
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
