import Promise from 'bluebird'


export function seed(knex) {
  const tableName = 'role'

  // Deletes ALL existing entries
  return knex(tableName).del()
    .then(() =>
      Promise.all([
        { slug: 'user', name: 'User' },
        { slug: 'mod', name: 'Moderator' },
        { slug: 'admin', name: 'Admin' },
        { slug: 'super', name: 'Super-admin' },
      ].map((fields) =>
        knex(tableName).insert(fields))))
}
