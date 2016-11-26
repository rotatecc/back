
exports.up = function(knex, Promise) {
  return knex.schema.createTable('account', function (table) {
    table.increments('id').primary()
    table.string('email').unique()
    table.string('username').unique()
    table.string('display')
    table.string('password')
    table.dateTime('last_login')
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('account')
}
