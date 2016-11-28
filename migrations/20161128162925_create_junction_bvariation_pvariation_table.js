
exports.up = function(knex, Promise) {
  return knex.schema.createTable('junction_bvariation_pvariation', function (table) {
    table.increments('id').primary()
    table.dateTime('date_added')

    table.integer('bvariation_id').unsigned()
    table.foreign('bvariation_id').references('id').inTable('bvariation')

    table.integer('pvariation_id').unsigned()
    table.foreign('pvariation_id').references('id').inTable('pvariation')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('junction_bvariation_pvariation')
}
