import { Router } from 'express'
import _ from 'lodash'

import db from './db'
import {
  ApiError,
  makePromiseHandler,
  validate,
  reqWithId,
  reqWithPage,
  hash,
  makeSingleOrReject
} from './utils'


export const methods = {
  HEAD: 'head',
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
}


export default function makeResource({ config, endpoints }) {
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
      // TODO check roles
      // TODO check mustOwn

      return Promise.resolve()
      .then(() => {
        if (requiresId) {
          return reqWithId(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        if (ep.method === methods.GET && ep.getType === 'paginate') {
          return reqWithPage(req)
        }

        return Promise.resolve()
      })
      .then(() => {
        if (hasBody) {
          const schemaFinal = ep.pickSchema
          ? _.pick(config.schema, ep.pickSchema)
          : config.schema

          return validate(schemaFinal, req.body)
        }

        return Promise.resolve()
      })
      .then((bodyMaybe) => {
        if (hasBody) {
          if (!_.isFunction(ep.prepareBody)) {
            return Promise.resolve(bodyMaybe)
          }

          return ep.prepareBody(bodyMaybe)
        }

        return Promise.resolve()
      })
      .then((bodyMaybe) => {
        const idMaybe = req.params.id && parseInt(req.params.id, 10)

        const returning = ep.returning || config.stdReturning || ['id']

        if (ep.method === methods.HEAD) {
          // HEAD
          ////////////////////////

          // TODO
        } else if (ep.method === methods.GET) {
          // GET
          ////////////////////////

          if (ep.getType === 'all') {
            return db
              .select(returning)
              .from(config.table)
          } else if (ep.getType === 'paginate') {
            return db
              .select(returning)
              .from(config.table)
              .limit(2) // TODO
              .offset(0) // TODO
          } else if (ep.getType === 'single') {
            return db
              .select(returning)
              .from(config.table)
              .where({ id: idMaybe })
              .then(makeSingleOrReject)
          }
        } else if (ep.method === methods.POST) {
          // POST
          ////////////////////////

          // TODO
        } else if (ep.method === methods.PUT || ep.method === methods.PATCH) {
          // PUT + PATCH
          ////////////////////////

          return db(config.table)
            .where('id', idMaybe)
            .update(bodyMaybe)
            .returning(returning)
            .then(makeSingleOrReject)
        } else if (ep.method === methods.DELETE) {
          // DELETE
          ////////////////////////

          return db(config.table)
            .where('id', idMaybe)
            .del()
            .then((deleteCount) => {
              if (deleteCount === 0) {
                return Promise.reject(new ApiError(404))
              }

              return Promise.resolve(null)
            })
        }

        return Promise.reject() // not reachable
      })
    }))
  }

  return r
}


/**
 * Example usage / api
 */


// makeResource({
//   config: {
//     table: 'account',
//     schema,
//     roles: [] | null // see below (but for entire resource)
//   },
//   endpoints: [
//     {
//       method: methods.GET,
//       suffix: null, // ex. '/password'
//       getType: 'single' // 'single' | 'paginate' | 'all'
//       returning: '*', // which fields to select/return (for GET/POST/PUT/PATCH)
//       roles: [] | null, // 'none' | 'auth' | 'mod' | 'admin' | 'super' (defaults to none)
//       mustOwn: true, // if the logged-in user must own the resource
//       pickSchema: [] || null, // pick from schema (for POST/PUT/PATCH), (defaults to all)
//       prepareBody: (body) => {
//         // prepare body for POST/PUT/PATCH after validation
//         // ex. hash password, remove fields
//         // returns promise
//         return Promise.resolve(body)
//       }
//     }
//   ]
// })
