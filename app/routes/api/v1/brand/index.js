import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { Brand } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Brand
        .query((q) => {
          if (req.query.search) {
            q.where('name', 'LIKE', `%${req.query.search}%`)
          }
        })
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: [],
        })
        .then(preparePaginatedResult)
      },
    },

    {
      method: methods.GET,
      getType: 'single',
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Brand
        .where({ id: idMaybe })
        .fetch({
          require: true,
          withRelated: [],
        })
      },
    },

    {
      method: methods.POST,
      role: 'admin',
      schema,
      makeResponse({ bodyMaybe }) {
        return Brand
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b) {
            return Promise.reject(makeApiError(400, 'Brand with name already exists'))
          }

          return null
        })
        .then(() =>
          // Forge new Brand
          Brand
          .forge(bodyMaybe)
          .save())
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return Brand
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b && b.get('id') !== idMaybe) {
            return Promise.reject(makeApiError(400, 'Brand with name already exists'))
          }

          return null
        })
        .then(() =>
          Brand
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: [],
          }))
        .catch(catchNotFound())
        .then((brand) => {
          brand.set(bodyMaybe)
          return brand.save()
        })
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Brand
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['parts'],
        })
        .catch(catchNotFound())
        .then((brand) => {
          if (!brand.related('parts').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, brand has dependent parts'))
          }

          return brand
        })
        .then((brand) =>
          brand.destroy({ require: true }))
        .then(() => null)
      },
    },
  ],
})
