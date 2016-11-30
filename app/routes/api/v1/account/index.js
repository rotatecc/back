import makeResource, { methods } from '../../../../resource'
import { hash } from '../../../../utils'

import schema from './schema'

export default makeResource({
  config: {
    table: 'account',
    schema,
    stdReturning: [
      'id',
      'email',
      'display',
      'last_login',
      'created_at',
      'updated_at'
    ]
  },
  endpoints: [
    {
      method: methods.GET,
      getType: 'single',
    },
    {
      method: methods.GET,
      getType: 'paginate',
    },
    {
      method: methods.PATCH,
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
