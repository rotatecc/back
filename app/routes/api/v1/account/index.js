import { Router } from 'express'

import { stdResponse, stdErrorResponse } from '../../../../utils'
import queries from './queries'


const r = Router()

r.get('/test', (req, res) => {
  queries
    .get(20, 0)
    .then(stdResponse(res))
    .catch(stdErrorResponse(res))
})

export default r
