import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'

import routes from './routes'

const port = 3001

// Create app
const app = express()

// Parse application/x-www-form-urlencoded
// ('extended' will use the qs lib to parse json values and such)
app.use(bodyParser.urlencoded({ extended: false }))

// Parse application/json
app.use(bodyParser.json())

// Parse cookies into req.cookies
app.use(cookieParser())

// Mount the first-level router as middleware
app.use('/', routes)

// Start server
app.listen(port, () => {
  console.log(`rotate.cc back-end is listening on port ${port}`)
})
