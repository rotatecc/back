
exports.up = function(knex, Promise) {
  return knex.schema.createTable('build', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.text('description')
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('build')
}
