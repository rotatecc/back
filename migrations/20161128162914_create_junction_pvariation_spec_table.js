
exports.up = function (knex, Promise) {
  return knex.schema.createTable('junction_pvariation_spec', function (table) {
    table.increments('id').primary()
    table.dateTime('date_added')
    table.text('value')

    table.integer('pvariation_id').unsigned()
    table.foreign('pvariation_id').references('id').inTable('pvariation')

    table.integer('spec_id').unsigned()
    table.foreign('spec_id').references('id').inTable('spec')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('junction_pvariation_spec')
}
