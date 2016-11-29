/**
 * Utils / misc
 */

import bcrypt from 'bcrypt'
import Joi from 'joi'

import config from './config'


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
