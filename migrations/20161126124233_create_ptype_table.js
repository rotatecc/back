
exports.up = function(knex, Promise) {
  return knex.schema.createTable('ptype', function (table) {
    table.increments('id').primary()
    table.string('name').unique()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('ptype')
}
