import { Router } from 'express'

import apiV1Routes from './v1'

const r = Router()

r.get('/', (req, res) => {
  res.send('rotate.cc api')
})

r.use('/v1', apiV1Routes)

export default r
