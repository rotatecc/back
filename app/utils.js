/**
 * Utils / misc
 */

import _ from 'lodash'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import Promise from 'bluebird'

import config from 'config'
import { Account } from 'models'


export function makeApiError(code, message) {
  const error = new Error(message || '')

  error.name = 'ApiError'
  error.code = code

  return error
}


export function jsonResponse(success, dataOrErrorCode, errorMessageMaybe) {
  if (success) {
    return {
      success: true,
      data: dataOrErrorCode,
    }
  }

  return {
    success: false,
    error: {
      code: dataOrErrorCode,
      message: errorMessageMaybe || config.standardHttpStatusCodes[dataOrErrorCode] || 'Unknown error',
    },
  }
}


export function stdResponse(res) {
  return (result) => {
    res.json(jsonResponse(true, result))
  }
}


export function stdErrorResponse(res) {
  return (err) => {
    if (err instanceof Error && err.name === 'ApiError') {
      res.status(err.code)
      res.json(jsonResponse(false, err.code, err.message))
    } else if (err instanceof Error && err.isJoi) {
      // Error is a Joi validation error, so the account is at fault

      // Map (potentially multiple) details to their messages
      const detailMessages = err.details.map((detail) => detail.message)

      res.status(400)
      res.json(jsonResponse(false, 400, `Validation error: ${detailMessages.join(', ')}`))
    } else if (err instanceof Error) {
      // Error is thrown by Knex directly, so it's safe to
      // say it is a 500 (internal server error).

      // Only print message if development, since it
      // could contain a raw SQL query or something.
      const message = config.isDevelopment
        ? `DEV ERROR: ${err.message}`
        : 'Internal server error'

      res.status(500)
      res.json(jsonResponse(false, 500, message))
    } else {
      res.status(500)
      res.json(jsonResponse(false, 500, 'Unknown error'))
    }
  }
}


export function makePromiseHandler(handler) {
  return (req, res, next) => {
    handler(req, res, next)
      .then(stdResponse(res))
      .catch(stdErrorResponse(res))
  }
}


export function hash(password) {
  // Promise-ify bcrypt hash

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.bcryptSaltRounds, (err, passwordHashed) => {
      if (err) {
        reject(err)
      } else {
        resolve(passwordHashed)
      }
    })
  })
}


/**
 * Ensure results has only one entry, then forward it.
 * If not, reject promise with a 404.
 *
 * Usage: new Promise(...).then(singleOrReject)
 */
export function makeSingleOrReject(results) {
  if (results.length === 1) {
    return results[0]
  }

  return Promise.reject(makeApiError(404))
}


// Determine if err is a connection error
export function isConnError(err) {
  return err && err.code === 'ECONNREFUSED'
}


export function catchNotFoundOrConnError(message = null) {
  return (err) => {
    // An ApiError was already thrown, so just forward it as a rejection
    if (err instanceof Error && err.name === 'ApiError') {
      return Promise.reject(err)
    }

    const [aeCode, aeMessage] = isConnError(err) ? [500, null] : [404, message]

    return Promise.reject(makeApiError(aeCode, aeMessage))
  }
}


/**
 * Use Joi to validate data with a schema,
 * returns a Promise
 */
export function validate(schema, data) {
  return new Promise((resolve, reject) => {
    Joi.validate(data, schema, (err, value) => {
      if (err) {
        reject(err)
      } else {
        resolve(value)
      }
    })
  })
}


export function reqWithId(req) {
  return validate(Joi.number().integer().positive().required(), req.params.id)
  .catch(() =>
    Promise.reject(makeApiError(400, 'Bad id in URI')))
}


export function reqWithPage(req) {
  return validate(Joi.number().integer().positive().required(), req.query.page)
  .catch(() =>
    Promise.reject(makeApiError(400, 'Bad page parameter')))
  .then((page) => {
    // mutate req.query.page with parsed int
    req.query.page = page // eslint-disable-line no-param-reassign
    return Promise.resolve()
  })
}


export function parseSearchParam(req) {
  // ?search can be missing, but if it's there, it can't be blank
  return validate(Joi.string().optional(), req.query.search)
  .catch(() =>
    Promise.reject(makeApiError(400, 'Bad search parameter')))
  .then((search) => {
    if (typeof search !== 'string') {
      req.query.search = search // eslint-disable-line no-param-reassign
    }
    return Promise.resolve()
  })
}


export function authenticate(email, password) {
  const jwtOptions = {
    algorithm: 'HS256', // TODO replace with RS256 + .pem file
  }

  const badAccountError = makeApiError(400, 'Bad email or password')

  // Find account

  return Account
  .where({ email })
  .fetch({
    require: true,
    withRelated: ['role', 'status'],
  })
  // 404 errors would reveal the account doesn't exist,
  // but we want to be ambiguous and give the
  // same error as giving a bad password:
  .catch((err) => Promise.reject(isConnError(err) ? makeApiError(500) : badAccountError))
  .then((account) => {
    // Check account status === okay

    if (account.related('status').get('slug') !== 'okay') {
      return Promise.reject(makeApiError(403, 'You are banned'))
    }

    return account
  })
  .then((account) =>
    // Verify password

    new Promise((resolve, reject) => {
      bcrypt.compare(password, account.get('password'), (err, res) => {
        if (err) {
          return Promise.reject(makeApiError(500, 'Password hashing failed'))
        }

        if (!res) {
          // Bad password
          return reject(badAccountError)
        }

        // Continue with account as obj
        return resolve(account.toJSON())
      })
    }))
  .then((account) =>
    new Promise((resolve, reject) => {
      const payload = Object.assign(
        {},
        _.omit(account, ['role', 'status', 'role_id', 'status_id']),
        { roleSlug: account.role.slug },
      )

      jwt.sign(payload, config.jwtSecret, jwtOptions, (err, token) => {
        if (err) {
          // We're at fault
          reject(makeApiError(500, 'Could not sign token'))
        }

        resolve(token)
      })
    }))
}


export function roleMeetsRequirement(role, requirement = 'super') {
  if (requirement === false) {
    return true
  }

  const roleLevel = config.roleOrder[role]
  const requirementLevel = config.roleOrder[requirement]

  if (requirement === true || !roleLevel || !requirementLevel) {
    return false
  }

  return roleLevel >= requirementLevel
}


/**
 * Verify a request's jwt auth if a certain role minimum is required
 * Can supply true for no access (forbidden to all), false for no auth.
 * otherwise, supply a role slug (ex. 'admin').
 *
 * If everything is valid, mutate req and set req.currentAccount = decoded payload
 */
export function verifyAuthAndRole(req, minRole = true) {
  if (minRole === false) {
    return Promise.resolve()
  }

  // Get the token from the request
  const token = req.headers['x-access-token']

  if (!token) {
    return Promise.reject(makeApiError(401, 'Auth token not supplied'))
  }

  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          reject(makeApiError(440, 'Auth token expired'))
        } else {
          // This is a JsonWebTokenError (jwt malformed, bad signature, etc)
          reject(makeApiError(401, err.message))
        }
      // JWT is good, now for the role...
      } else if (!roleMeetsRequirement(decoded.roleSlug, minRole)) {
        // Send 403 forbidden (authenticated, but forbidden)
        reject(makeApiError(403))
      } else {
        // All set!

        // Mutate req by setting currentAccount
        req.currentAccount = decoded // eslint-disable-line no-param-reassign

        // Resolve
        resolve(decoded)
      }
    })
  })
}


// Bookshelf's model.fetchPage result json-stringifies to only the models.
// This is a simple helper to bypass its toJSON
// and include the pagination metadata
export function preparePaginatedResult({ models, pagination }) {
  return Promise.resolve({ results: models, pagination })
}


// Verify the current account's ownership over a resource
// Assumes req.currentAccount has been set, if not, fail
export function verifyOwnership(resource, req, accountIdGetter = ((r) => r.get('account_id'))) {
  if (!req.currentAccount || req.currentAccount.id !== accountIdGetter(resource)) {
    return Promise.reject(makeApiError(403))
  }

  return Promise.resolve(resource)
}


// Makes a handler that verifies the current account's ownership over a resource
// Assumes req.currentAccount has been set, if not, fail
export function makeOwnershipVerifier(req, accountIdGetter) {
  return (resource) =>
    verifyOwnership(resource, req, accountIdGetter)
}
