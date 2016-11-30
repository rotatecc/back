import makeResource, { methods } from '../../../../resource'
import { authenticate } from '../../../../utils'

import schema from '../account/schema'


export default makeResource({
  config: {
    table: 'account',
    schema,
    defaultReturning: [
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
      suffix: '/login',
      roles: false,
      method: methods.POST,
      pickSchema: ['email', 'password_login'],
      overrideResponse: ({ email, password_login }) => {
        return authenticate(email, password_login)
      }
    }
  ]
})
