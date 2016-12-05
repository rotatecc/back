require('../app/setup')
var hash = require('../app/utils').hash

exports.seed = function(knex, Promise) {
  var tableName = 'account'

  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        { name: 'one', role: 4, status: 1 },
        { name: 'two', role: 1, status: 1 },
        { name: 'three', role: 1, status: 1 },
        { name: 'four', role: 1, status: 1 },
      ].map(function (fields) {
        return hash(fields.name).then((passwordHashed) => {
          return knex(tableName).insert({
            email: fields.name + '@rotate.cc',
            display: fields.name,
            password: passwordHashed,
            role_id: fields.role,
            status_id: fields.status,
          })
        })
      }))
    })
}
