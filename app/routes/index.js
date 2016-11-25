import { Router } from 'express'

import apiRoutes from './api'

const r = Router()

r.get('/', (req, res) => {
  res.send('rotate.cc')
})

r.use('/api', apiRoutes)

export default r
