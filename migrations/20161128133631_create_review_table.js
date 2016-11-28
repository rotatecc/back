
exports.up = function(knex, Promise) {
  return knex.schema.createTable('review', function (table) {
    table.increments('id').primary()
    table.integer('rating').unsigned()
    table.text('content')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('review')
}
