import express from 'express'

import routes from './routes'

const port = 3001

const app = express()

app.use('/', routes)

app.listen(port, () => {
  console.log(`rotate.cc back-end is listening on port ${port}`)
})
