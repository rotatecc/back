
export function up(knex) {
  return knex.schema.createTable('pvariation', (table) => {
    table.increments('id').primary()
    table.timestamps()

    // belongsTo Part
    table.integer('part_id').unsigned()
    table.foreign('part_id').references('id').inTable('part')
  })
}

export function down(knex) {
  return knex.schema.dropTable('pvariation')
}
