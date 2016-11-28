
exports.up = function(knex, Promise) {
  return knex.schema.createTable('photo', function (table) {
    table.increments('id').primary()
    table.string('s3key')
    table.text('description')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('photo')
}
