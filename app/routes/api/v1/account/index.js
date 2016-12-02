import makeResource, { methods } from '../../../../resource'
import { hash } from '../../../../utils'

import { Account } from '../../../../models'
import schema from './schema'

const defaultReturning = [
  'id',
  'email',
  'display',
  'last_login',
  'created_at',
  'updated_at',

  'role_id',
  'status_id',
]

export default makeResource({
  config: {
    model: Account,
    schema,
    defaultReturning
  },
  endpoints: [
    {
      method: methods.GET,
      getType: 'single',
      overrideResponse(idMaybe, bodyMaybe) {
        return Account
          .where({ id: idMaybe })
          .fetch({
            columns: defaultReturning,
            withRelated: ['role', 'status'],
          })
      },
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
