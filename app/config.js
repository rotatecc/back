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

export default config
