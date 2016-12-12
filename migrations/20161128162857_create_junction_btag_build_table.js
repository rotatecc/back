
export function up(knex) {
  return knex.schema.createTable('junction_btag_build', (table) => {
    table.increments('id').primary()
    table.dateTime('date_added')

    table.integer('btag_id').unsigned()
    table.foreign('btag_id').references('id').inTable('btag')

    table.integer('build_id').unsigned()
    table.foreign('build_id').references('id').inTable('build')
  })
}

export function down(knex) {
  return knex.schema.dropTable('junction_btag_build')
}
