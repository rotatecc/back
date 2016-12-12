
export function up(knex) {
  return knex.schema.createTable('brand', (table) => {
    table.increments('id').primary()
    table.string('name').unique()
    table.timestamps()
  })
}

export function down(knex) {
  return knex.schema.dropTable('brand')
}
