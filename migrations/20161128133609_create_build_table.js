
exports.up = function(knex, Promise) {
  return knex.schema.createTable('build', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.text('description')
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('build')
}
