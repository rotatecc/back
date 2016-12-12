import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'bvariationtype'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(() =>
      Promise.all([
        { slug: 'blueprint', name: 'Blueprint' },
        { slug: 'progress', name: 'Progress' },
        { slug: 'completed', name: 'Completed' },
        { slug: 'variation', name: 'Variation' },
      ].map((fields) =>
        knex(tableName).insert(fields))))
}
