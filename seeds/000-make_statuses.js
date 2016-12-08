
exports.seed = function (knex, Promise) {
  var tableName = 'status'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        { slug: 'okay', name: 'Okay' },
        { slug: 'banned', name: 'Banned' },
      ].map(function (fields) {
        return knex(tableName).insert(fields)
      }))
    })
}
