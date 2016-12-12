import { Router } from 'express'

const r = Router()

r.get('/', (req, res) => {
  res.send('rotate.cc api v1')
})

// Require and mount sub-routers for each endpoint

const endpoints = [
  'auth',
  'account',
  'brand',
  'spec',
  'btag',
  'ptype',
  'part',
  'build',
  'comment',
  'photo',
]

endpoints.forEach((endpoint) => {
  r.use(`/${endpoint}`, require(`./${endpoint}`).default) // eslint-disable-line global-require, import/no-dynamic-require
})

export default r
