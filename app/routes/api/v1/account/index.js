import makeResource, { methods } from '../../../../resource'
import { hash } from '../../../../utils'

import schema from './schema'


export default makeResource({
  config: {
    table: 'account',
    schema
  },
  endpoints: [
    {
      method: methods.GET,
      getType: 'single',
      returning: '*', // NOTE remove pw
    },
    {
      method: methods.GET,
      getType: 'paginate',
      returning: '*', // NOTE remove pw
    },
    {
      method: methods.PATCH,
      returning: '*', // NOTE remove pw
      pickSchema: ['email', 'display'],
    },
    {
      method: methods.DELETE,
    },
    {
      suffix: '/password',
      method: methods.PUT,
      returning: ['id'],
      pickSchema: ['password', 'password_confirmation'],
      prepareBody: ({ password }) => {
        return hash(password)
        .catch((err) => {
          return Promise.reject(new ApiError(500, `Password hashing failed: ${err.message}`))
        })
        .then((passwordHashed) => {
          return {
            password: passwordHashed
          }
        })
      }
    },
  ]
})
