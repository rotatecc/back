/**
 * Config
 *
 * Including forwarding from env variables
 */

const config = {}

config.env = process.env.NODE_ENV || 'production'

config.tables = {
  account: 'account'
}

export default config
