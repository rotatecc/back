
exports.seed = function(knex, Promise) {
  var tableName = 'account'

  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        { username: 'one' },
        { username: 'two' },
        { username: 'three' },
        { username: 'four' },
      ].map(function (fields) {
        return knex(tableName).insert({
          username: fields.username,
          display: fields.username,
          email: fields.username + '@test.com'
        })
      }))
    })
}
