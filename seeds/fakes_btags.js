exports.seed = function (knex, Promise) {
  var tableName = 'btag'

  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        'Road',
        // TODO more
      ].map(function (name) {
        return knex(tableName).insert({
          name: name,
        })
      }))
    })
}
