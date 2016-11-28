
exports.up = function(knex, Promise) {
  return knex.schema.createTable('btag', function (table) {
    table.increments('id').primary()
    table.string('name').unique()
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('btag')
}
