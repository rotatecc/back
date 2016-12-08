
exports.up = function (knex, Promise) {
  return knex.schema.createTable('junction_part_spec', function (table) {
    table.increments('id').primary()
    table.dateTime('date_added')
    table.text('value')

    table.integer('part_id').unsigned()
    table.foreign('part_id').references('id').inTable('part')

    table.integer('spec_id').unsigned()
    table.foreign('spec_id').references('id').inTable('spec')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('junction_part_spec')
}
