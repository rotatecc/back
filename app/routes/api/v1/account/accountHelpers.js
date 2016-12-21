import Promise from 'bluebird'

import { Account, Status } from 'models'
import { catchNotFoundOrConnError, makeApiError } from 'utils'


export function setAccountStatus(userId, isBanned, tmix) {
  return Promise.all([
    Status
    .where('slug', isBanned ? 'banned' : 'okay')
    .fetch({
      ...tmix,
      require: true,
    }),
    Account
    .where({ id: userId })
    .fetch({
      ...tmix,
      require: true,
      withRelated: ['role', 'status'],
    }),
  ])
  .catch(catchNotFoundOrConnError())
  .spread((status, account) => {
    if (account.related('role').get('slug') === 'super') {
      return Promise.reject(makeApiError(400, 'Cannot set status of super-admin'))
    }

    return account.save({
      status_id: status.get('id'),
    }, tmix)
  })
  .then(() => null)
}
