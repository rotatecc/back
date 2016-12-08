exports.seed = function (knex, Promise) {
  var tableName = 'ptype'

  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        'Saddle',
        // TODO more
      ].map(function (name) {
        return knex(tableName).insert({
          name: name,
        })
      }))
    })
}
