/**
 * Utils / misc
 */

import _ from 'lodash'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import Joi from 'joi'

import config from './config'
import { Account } from './models'


export class ApiError {
  code
  message

  constructor(code, message) {
    this.code = code
    this.message = message
  }
}


export function jsonResponse(success, dataOrErrorCode, errorMessageMaybe) {
  if (success) {
    return {
      success: true,
      data: dataOrErrorCode
    }
  }

  return {
    success: false,
    error: {
      code: dataOrErrorCode,
      message: errorMessageMaybe || config.standardHttpStatusCodes[dataOrErrorCode] || "Unknown error"
    }
  }
}


export function stdResponse(res) {
  return (result) => {
    res.json(jsonResponse(true, result))
  }
}


export function stdErrorResponse(res) {
  return (err) => {
    if (err instanceof ApiError) {
      res.status(err.code)
      res.json(jsonResponse(false, err.code, err.message))
    } else if (err instanceof Error && err.isJoi) {
      // Error is a Joi validation error, so the user is at fault

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
  // promise-ify bcrypt hash

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, config.bcryptSaltRounds, function(err, hash) {
      if (err) {
        reject(err)
      } else {
        resolve(hash)
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

  return Promise.reject(new ApiError(404))
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
    .catch(err => {
      return Promise.reject(new ApiError(400, 'Bad id'))
    })
}


export function reqWithPage(req) {
  return validate(Joi.number().integer().positive().required(), req.query.page)
    .catch(err => {
      return Promise.reject(new ApiError(400, 'Bad page'))
    })
}


export function authenticate(email, password) {
  const jwtOptions = {
    algorithm: 'HS256' // TODO replace with RS256 + .pem file
  }

  const badUserError = new ApiError(401, 'bad email or password')

  // find user

  return Account
  .query()
  .where({ email })
  .then(makeSingleOrReject)
  // 404 errors would reveal the user doesn't exist,
  // but we want to be ambiguous and give the
  // same error as giving a bad password:
  .catch(() => Promise.reject(badUserError))
  .then((user) => {
    // verify password

    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {
          return Promise.reject(new ApiError(500, 'Password hashing failed'))
        }

        if (!res) {
          // bad password
          return reject(badUserError)
        }

        // continue with user obj, omitting the password entry
        return resolve(_.omit(user, ['password']))
      })
    })
  })
  .then((user) => {
    return new Promise((resolve, reject) => {
      jwt.sign(user, config.jwtSecret, jwtOptions, (err, token) => {
        if (err) {
          // we're at fault
          reject(new ApiError(500, 'could not sign token'))
        }

        resolve(token)
      })
    })
  })
}


export function verifyAuthRole(req, roleSlugs) {
  if (roleSlugs === false) {
    return Promise.resolve()
  }

  const token = req.headers['x-access-token']

  if (!token) {
    return Promise.reject(new ApiError(401, 'Auth token not supplied'))
  }

  // if roleSlugs wasn't an array, put its value in an array
  const roleSlugsFinal = _.isArray(roleSlugs) ? roleSlugs : [roleSlugs]

  return new Promise((resolve, reject) => {
    jwt.verify(token, config.jwtSecret, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // NOTE 440 isn't a standard response code,
          // defined by Microsoft, means login expiration
          reject(new ApiError(440, 'Auth token expired'))
        }

        // This is a JsonWebTokenError (jwt malformed, bad signature, etc)
        reject(new ApiError(401, err.message))
      }

      // TODO uncomment role checking
      // // jwt is good, now for the role...
      // if (roleSlugs.includes(decoded.roleSlug)) {
      //   // send 403 forbidden (authenticated, but forbidden)
      //   reject(new ApiError(403, 'forbidden'))
      // }

      // all set, resolve with the payload
      resolve(decoded)
    })
  })
}
