
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bvariation', function (table) {
    table.increments('id').primary()
    table.timestamps()

    // belongsTo Build
    table.integer('build_id').unsigned()
    table.foreign('build_id').references('id').inTable('build')
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('bvariation')
}
