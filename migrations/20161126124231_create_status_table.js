
export function up(knex) {
  return knex.schema.createTable('status', (table) => {
    table.increments('id').primary()
    table.string('slug').unique()
    table.string('name').unique()
  })
}

export function down(knex) {
  return knex.schema.dropTable('status')
}
