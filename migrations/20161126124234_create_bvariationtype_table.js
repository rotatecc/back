
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bvariationtype', function (table) {
    table.increments('id').primary()
    table.string('slug').unique()
    table.string('name').unique()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('bvariationtype')
}
