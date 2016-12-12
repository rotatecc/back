import Promise from 'bluebird'
import { hash } from 'utils'


export function seed(knex) {
  const tableName = 'account'

  return knex(tableName).del()
    .then(() =>
      Promise.all([
        { name: 'one', role: 4, status: 1 },
        { name: 'two', role: 1, status: 1 },
        { name: 'three', role: 1, status: 1 },
        { name: 'four', role: 1, status: 1 },
      ].map((fields) =>
        hash(fields.name).then((passwordHashed) =>
          knex(tableName).insert({
            email: `${fields.name}@rotate.cc`,
            display: fields.name,
            password: passwordHashed,
            role_id: fields.role,
            status_id: fields.status,
          })))))
}
