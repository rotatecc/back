import config from 'config'
import makeResource, { methods } from 'resource'
import { makeApiError, preparePaginatedResult, catchNotFound } from 'utils'

import { BTag } from 'models'

import schema from './schema'


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return BTag
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
        return BTag
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
        return BTag
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b) {
            return Promise.reject(makeApiError(400, 'BTag with name already exists'))
          }

          return null
        })
        .then(() =>
          // Forge new BTag
          BTag
          .forge(bodyMaybe)
          .save())
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return BTag
        .where({ name: bodyMaybe.name })
        .fetch()
        .then((b) => {
          if (b && b.get('id') !== idMaybe) {
            return Promise.reject(makeApiError(400, 'BTag with name already exists'))
          }

          return null
        })
        .then(() =>
          BTag
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: [],
          }))
        .catch(catchNotFound())
        .then((btag) => {
          btag.set(bodyMaybe)
          return btag.save()
        })
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return BTag
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: ['builds'],
        })
        .catch(catchNotFound())
        .then((btag) => {
          if (!btag.related('builds').isEmpty()) {
            return Promise.reject(makeApiError(400, 'Cannot delete, btag has dependent builds'))
          }

          return btag
        })
        .then((btag) =>
          btag.destroy({ require: true }))
        .then(() => null)
      },
    },
  ],
})
