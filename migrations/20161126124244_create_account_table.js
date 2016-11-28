
exports.up = function(knex, Promise) {
  return knex.schema.createTable('account', function (table) {
    table.increments('id').primary()
    table.string('email').unique()
    table.string('username').unique()
    table.string('display')
    table.string('password')
    table.dateTime('last_login')
    table.boolean('status')
    table.timestamps()

    // belongsTo Role
    table.integer('role_id').unsigned()
    table.foreign('role_id').references('id').inTable('role')

    // belongsTo Status
    table.integer('status_id').unsigned()
    table.foreign('status_id').references('id').inTable('status')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('account')
}
