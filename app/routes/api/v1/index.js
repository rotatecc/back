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
]

endpoints.forEach((endpoint) => {
  r.use(`/${endpoint}`, require(`./${endpoint}`).default)
})

export default r
