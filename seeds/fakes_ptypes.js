import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'ptype'

  return knex(tableName).del()
    .then(() =>
      Promise.all([
        'Saddle',
        // TODO more
      ].map((name) =>
        knex(tableName).insert({ name }))))
}
