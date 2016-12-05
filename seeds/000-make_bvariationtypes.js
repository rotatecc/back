
exports.seed = function(knex, Promise) {
  var tableName = 'bvariationtype'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(function () {
      return Promise.all([
        { slug: 'blueprint', name: 'Blueprint' },
        { slug: 'progress', name: 'Progress' },
        { slug: 'completed', name: 'Completed' },
        { slug: 'variation', name: 'Variation' },
      ].map(function (fields) {
        return knex(tableName).insert(fields)
      }))
    })
}
