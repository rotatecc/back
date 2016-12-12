import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'btag'

  return knex(tableName).del()
    .then(() =>
      Promise.all([
        'Road',
        // TODO more
      ].map((name) =>
        knex(tableName).insert({ name }))))
}
