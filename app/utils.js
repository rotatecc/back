/**
 * Utils / misc
 */


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
    } else if (err instanceof Error) {
      // Error is thrown by Knex directly, so it's safe to
      // say it is a 500 (internal server error).
      // Only print message if development, since it
      // could contain the raw SQL query.
      res.status(500)
      res.json(jsonResponse(false, 500, config.isDevelopment ? err.message : 'Internal Server Error'))
    } else {
      res.status(500)
      res.json(jsonResponse(false, 500, 'Error unknown'))
    }
  }
}


export default {
  jsonResponse,
  stdResponse,
  stdErrorResponse
}
