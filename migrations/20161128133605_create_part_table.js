
exports.up = function(knex, Promise) {
  return knex.schema.createTable('part', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('manu_id')
    table.text('manu_description')
    table.text('our_note')
    table.date('release_date')
    table.timestamps()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('part')
}
