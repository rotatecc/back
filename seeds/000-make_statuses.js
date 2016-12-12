import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'status'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(() =>
      Promise.all([
        { slug: 'okay', name: 'Okay' },
        { slug: 'banned', name: 'Banned' },
      ].map((fields) =>
        knex(tableName).insert(fields))))
}
