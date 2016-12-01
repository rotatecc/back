
exports.up = function(knex, Promise) {
  return knex.schema.createTable('photo', function (table) {
    table.increments('id').primary()
    table.string('s3key')
    table.text('description')
    table.enu('modstatus', ['non', 'approve', 'reject'])
    table.timestamps()

    // belongsTo Account
    table.integer('account_id').unsigned()
    table.foreign('account_id').references('id').inTable('account')

    // morphTo photoable
    table.integer('photoable_id').unsigned()
    table.string('photoable_type').notNullable()
  })
}

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('photo')
}
