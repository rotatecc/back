
exports.seed = function(knex, Promise) {
  var tableName = 'role'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        { slug: 'user', name: 'User' },
        { slug: 'mod', name: 'Moderator' },
        { slug: 'admin', name: 'Admin' },
        { slug: 'super', name: 'Super-admin' },
      ].map(function (fields) {
        return knex(tableName).insert(fields)
      }))
    })
}
