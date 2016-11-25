import { Router } from 'express'

const r = Router()

r.get('/', (req, res) => {
  res.send('rotate.cc api v1')
})

r.get('/test', (req, res) => {
  res.send('the test works')
})

export default r
