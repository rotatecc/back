
exports.up = function(knex, Promise) {
  return knex.schema.createTable('review', function (table) {
    table.increments('id').primary()
    table.integer('rating').unsigned()
    table.text('content')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('review')
}
