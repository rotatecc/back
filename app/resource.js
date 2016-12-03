import { Router } from 'express'
import _ from 'lodash'

import {
  ApiError,
  makePromiseHandler,
  validate,
  reqWithId,
  reqWithPage,
  hash,
  makeSingleOrReject,
  verifyAuthAndRole
} from './utils'


export const methods = {
  HEAD: 'head',
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
}


export default function makeResource({ endpoints }) {
  const r = Router()

  for (let ep of endpoints) {
    if (!Object.values(methods).includes(ep.method)) {
      continue
    }

    const requiresId = ([
      methods.HEAD,
      methods.PUT,
      methods.PATCH,
      methods.DELETE
    ].includes(ep.method) || (ep.method === methods.GET && ep.getType === 'single'))

    const hasBody = ([
      methods.PUT,
      methods.POST,
      methods.PATCH
    ]).includes(ep.method)

    const path = (requiresId ? '/:id' : '') + (ep.suffix || '')

    r[ep.method](path, makePromiseHandler((req) => {
      return Promise.resolve()
      .then(() => {
        // check auth + role

        return verifyAuthAndRole(req, ep.role)
      })
      .then(() => {
        // if needed, check that req.params.id exists
        // and that it's an integer

        if (requiresId) {
          return reqWithId(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        // if we're paginating, make sure ?page is there,
        // then mutate req with the parsed page

        if (ep.method === methods.GET && ep.getType === 'paginate') {
          return reqWithPage(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        // if this request has a body, validate it against a schema

        if (hasBody && ep.schema) {
          return validate(ep.schema, req.body)
        }

        return Promise.resolve()
      })
      .then((bodyMaybe) => {
        // if this request has a body, and ep.prepareBody was specified,
        // then use it as a transformation

        if (hasBody) {
          if (!_.isFunction(ep.prepareBody)) {
            return Promise.resolve(bodyMaybe)
          }

          return ep.prepareBody(bodyMaybe)
        }

        return Promise.resolve()
      })
      .then((bodyMaybe) => {
        // make response

        // parse id if it's there
        const idMaybe = (requiresId && req.params.id && parseInt(req.params.id, 10)) || null

        return ep.makeResponse({
          req,
          idMaybe,
          bodyMaybe,
        })
      })
    }))
  }

  return r
}
