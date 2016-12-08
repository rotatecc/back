import { Router } from 'express'
import _ from 'lodash'
import Promise from 'bluebird'

import {
  makePromiseHandler,
  validate,
  reqWithId,
  reqWithPage,
  verifyAuthAndRole,
  parseSearchParam,
} from 'utils'


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

  endpoints.forEach((ep) => {
    if (!Object.values(methods).includes(ep.method)) {
      // Skip this endpoint since the method isn't supported
      return
    }

    const requiresId = ([
      methods.HEAD,
      methods.PUT,
      methods.PATCH,
      methods.DELETE,
    ].includes(ep.method) || (ep.method === methods.GET && ep.getType === 'single'))

    const hasBody = ([
      methods.PUT,
      methods.POST,
      methods.PATCH,
    ]).includes(ep.method)

    const path = (requiresId ? '/:id' : '') + (ep.suffix || '')

    r[ep.method](path, makePromiseHandler((req) =>
      Promise.resolve()
      .then(() =>
        // Check auth + role
        // (mutates req.currentAccount if ep.role is not false and everything checks out)

        verifyAuthAndRole(req, ep.role))
      .then(() => {
        // If needed, check that req.params.id exists and that it's an integer

        if (requiresId) {
          return reqWithId(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        // If we're paginating, make sure ?page is there,
        // then mutate req with the parsed page

        if (ep.method === methods.GET && ep.getType === 'paginate') {
          return reqWithPage(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        // If this is a get request and getType is paginate or all, then attempt
        // to parse the ?search query parameter

        if (ep.method === methods.GET && ['paginate', 'all'].includes(ep.getType)) {
          return parseSearchParam(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        // If this request has a body, validate it against a schema

        if (hasBody && ep.schema) {
          return validate(ep.schema, req.body)
        }

        return Promise.resolve()
      })
      .then((bodyMaybe) => {
        // If this request has a body, and ep.prepareBody was specified,
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
        // Make response

        // Parse id if it's there
        const idMaybe = (requiresId && req.params.id && parseInt(req.params.id, 10)) || null

        return ep.makeResponse({
          req,
          idMaybe,
          bodyMaybe,
        })
      })))
  })

  return r
}
