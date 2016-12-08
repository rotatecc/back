/**
 * Config
 *
 * Including forwarding from env variables
 */

const config = {}

config.env = process.env.NODE_ENV || 'production'

config.isDevelopment = config.env === 'development'

config.jwtSecret = 'secret' // TODO

config.standardHttpStatusCodes = {
  // TODO more
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
}

config.bcryptSaltRounds = 10

config.roleOrder = {
  user: 1,
  mod: 2,
  admin: 3,
  super: 4,
}

config.standardPageSize = 20

export default config
