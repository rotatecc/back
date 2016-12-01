
exports.up = function(knex, Promise) {
  return knex.schema.createTable('comment', function (table) {
    table.increments('id').primary()
    table.text('content')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')

    // morphTo commentable
    table.integer('commentable_id').unsigned()
    table.string('commentable_type').notNullable()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('comment')
}
