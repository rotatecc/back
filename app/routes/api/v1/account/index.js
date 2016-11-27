import { Router } from 'express'
import Joi from 'joi'

import { ApiError, makePromiseHandler, validate, reqWithId } from '../../../../utils'
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
    return queries.update(parseInt(req.params.id, 10), body)
  })
}))

export default r
