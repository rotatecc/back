
export function up(knex) {
  return knex.schema.createTable('bvariation', (table) => {
    table.increments('id').primary()
    table.string('name')
    table.integer('order').unsigned()
    table.timestamps()

    // belongsTo BVariationType
    table.integer('bvariationtype_id').unsigned()
    table.foreign('bvariationtype_id').references('id').inTable('bvariationtype')

    // belongsTo Build
    table.integer('build_id').unsigned()
    table.foreign('build_id').references('id').inTable('build')
  })
}

export function down(knex) {
  return knex.schema.dropTable('bvariation')
}
