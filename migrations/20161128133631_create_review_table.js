
export function up(knex) {
  return knex.schema.createTable('review', (table) => {
    table.increments('id').primary()
    table.integer('rating').unsigned()
    table.text('content')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')

    // morphTo reviewable
    table.integer('reviewable_id').unsigned()
    table.string('reviewable_type').notNullable()
  })
}

export function down(knex) {
  return knex.schema.dropTable('review')
}
