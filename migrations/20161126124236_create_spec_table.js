
export function up(knex) {
  return knex.schema.createTable('spec', (table) => {
    table.increments('id').primary()
    table.string('name').unique()
  })
}

export function down(knex) {
  return knex.schema.dropTable('spec')
}
