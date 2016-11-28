
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pvariation', function (table) {
    table.increments('id').primary()
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pvariation')
}
