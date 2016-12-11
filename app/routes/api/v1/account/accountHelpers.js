import Promise from 'bluebird'

import { Account, Status } from 'models'
import { catchNotFound, makeApiError } from 'utils'


export function setAccountStatus(userId, isBanned) {
  return Promise.all([
    Status.where('slug', isBanned ? 'banned' : 'okay').fetch({ require: true }),
    Account
    .where({ id: userId })
    .fetch({
      withRelated: ['role', 'status'],
      require: true,
    }),
  ])
  .catch(catchNotFound())
  .spread((status, account) => {
    if (account.related('role').get('slug') === 'super') {
      return Promise.reject(makeApiError(400, 'Cannot set status of super-admin'))
    }

    account.set('status_id', status.get('id'))
    return account.save().then(() => null)
  })
}
