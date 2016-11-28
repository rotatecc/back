
exports.up = function(knex, Promise) {
  return knex.schema.createTable('status', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('status')
}
