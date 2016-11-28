
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pvariation', function (table) {
    table.increments('id').primary()
    table.timestamps()

    // belongsTo Part
    table.integer('part_id').unsigned()
    table.foreign('part_id').references('id').inTable('part')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pvariation')
}
