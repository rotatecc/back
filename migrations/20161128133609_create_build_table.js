
export function up(knex) {
  return knex.schema.createTable('build', (table) => {
    table.increments('id').primary()
    table.string('name')
    table.text('description')
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')
  })
}

export function down(knex) {
  return knex.schema.dropTable('build')
}
