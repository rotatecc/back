
exports.up = function (knex, Promise) {
  return knex.schema.createTable('part', function (table) {
    table.increments('id').primary()
    table.string('name')
    table.string('manu_id')
    table.text('manu_description')
    table.text('our_note')
    table.date('date_released')
    table.timestamps()

    // belongsTo PType
    table.integer('ptype_id').unsigned()
    table.foreign('ptype_id').references('id').inTable('ptype')

    // belongsTo Brand
    table.integer('brand_id').unsigned()
    table.foreign('brand_id').references('id').inTable('brand')
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('part')
}
