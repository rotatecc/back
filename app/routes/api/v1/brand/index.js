import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFound } from 'utils'

import { Brand } from 'models'

import schema from './schema'


// brand: get-paginate, get-single (), put, post, delete


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'super',
      makeResponse({ req }) {
        return Brand
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
      role: 'super',
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
      role: 'super',
      schema,
      makeResponse({ bodyMaybe }) {
        // TODO check for duplicate name
        return Brand
        .forge(bodyMaybe)
        .save()
      },
    },

    {
      method: methods.PUT,
      role: 'super',
      schema,
      makeResponse({ idMaybe }) {
        // TODO check for duplicate name
        return Brand
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: []
        })
        .catch(catchNotFound)
        .then(makeOwnershipVerifier(req))
        .then((brand) => {
          brand.set(bodyMaybe)
          return brand.save()
        })
      }
    },

    {
      method: methods.DELETE,
      role: 'super',
      makeResponse({ idMaybe }) {
        return Brand
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['parts']
        })
        .catch(catchNotFound)
        .then((brand) => {
          if (!brand.related('parts').isEmpty()) {
            return Promise.reject(new ApiError(400, 'Cannot delete, brand has dependent parts'))
          }

          return brand
        })
        .then((brand) => {
          return brand.destroy({ require: true })
        })
        .then((b) => null)
      }
    },
  ]
})
