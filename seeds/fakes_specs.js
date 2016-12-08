exports.seed = function (knex, Promise) {
  var tableName = 'spec'

  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        'Weight',
        'Color',
        // TODO more
      ].map(function (name) {
        return knex(tableName).insert({
          name: name,
        })
      }))
    })
}
