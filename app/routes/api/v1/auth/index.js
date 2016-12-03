import _ from 'lodash'

import makeResource, { methods } from 'resource'
import { authenticate } from 'utils'

import { Account } from 'models'

import schema from '../account/schema'


export default makeResource({
  endpoints: [
    {
      suffix: '/login',
      role: false,
      method: methods.POST,
      schema: { email: schema.email, password: schema.password_login },
      makeResponse: ({ bodyMaybe }) => {
        const { email, password } = bodyMaybe
        return authenticate(email, password)
      }
    }
  ]
})
