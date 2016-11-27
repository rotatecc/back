import { Router } from 'express'
import validator from 'validator'

import { ApiError, makePromiseHandler } from '../../../../utils'
import queries from './queries'


const r = Router()

r.get('/:id', makePromiseHandler((req) => {
  if (!validator.isInt(req.params.id)) {
    return Promise.reject(new ApiError(400, 'Bad id'))
  }

  return queries.find(validator.toInt(req.params.id))
}))

export default r
