import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'spec'

  return knex(tableName).del()
    .then(() =>
      Promise.all([
        'Weight',
        'Color',
        // TODO more
      ].map((name) =>
        knex(tableName).insert({ name }))))
}
