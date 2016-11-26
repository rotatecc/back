import { Router } from 'express'

import queries from './queries'

const r = Router()

r.post('/register', (req, res) => {
  res.send('register')
})

r.post('/login', (req, res) => {
  res.send('login')
})

r.post('/logout', (req, res) => {
  res.send('logout')
})

r.get('/user', (req, res) => {
  res.send('user info')
})

export default r
