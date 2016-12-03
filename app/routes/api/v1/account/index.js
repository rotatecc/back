import _ from 'lodash'

import config from '../../../../config'
import makeResource, { methods } from '../../../../resource'
import { hash, preparePaginatedResult, catchNotFound } from '../../../../utils'

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
  endpoints: [
    {
      method: methods.GET,
      getType: 'single',
      role: 'super',
      makeResponse({ idMaybe }) {
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
      makeResponse({ req }) {
        return Account
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          columns: defaultReturning,
          withRelated: ['role', 'status'],
        })
        .then(preparePaginatedResult)
      },
    },
    {
      method: methods.PATCH,
      schema: _.pick(schema, ['email', 'display']),
      makeResponse({ idMaybe, bodyMaybe }) {
        return Account
        .where('id', idMaybe)
        .fetch({ require: true })
        .catch(catchNotFound)
        .then((account) => {
          account.set(bodyMaybe)
          return account.save()
        })
      },
    },
    {
      suffix: '/password',
      method: methods.PUT,
      schema: _.pick(schema, ['password', 'password_confirmation']),
      prepareBody({ password }) {
        return hash(password)
        .catch((err) => {
          return Promise.reject(new ApiError(500, `Password hashing failed: ${err.message}`))
        })
        // put hash under password key
        .then((password) => ({ password }))
      },
      makeResponse() {
        // TODO
        // * check existence
        // * check ownership
        // * save
        return true
      },
    },
  ]
})
