/**
 * Config
 *
 * Including forwarding from env variables
 */

const config = {}

config.env = process.env.NODE_ENV || 'production'

config.isDevelopment = config.env === 'development'

config.tables = {
  account: 'account'
}

config.standardHttpStatusCodes = {
  // TODO
  400: 'Bad Request',
  404: 'Not Found',
  500: 'Internal Server Error'
}

config.bcryptSaltRounds = 10

export default config
