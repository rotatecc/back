
export function up(knex) {
  return knex.schema.createTable('account', (table) => {
    table.increments('id').primary()
    table.string('email').unique()
    table.string('display')
    table.string('password')
    table.dateTime('last_login')
    table.timestamps()

    // belongsTo Role
    table.integer('role_id').unsigned()
    table.foreign('role_id').references('id').inTable('role')

    // belongsTo Status
    table.integer('status_id').unsigned()
    table.foreign('status_id').references('id').inTable('status')
  })
}

export function down(knex) {
  return knex.schema.dropTable('account')
}
