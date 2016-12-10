import _ from 'lodash'

import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFound } from 'utils'

import { Build } from 'models'

import schema from './schema'


const standardRelated = [
  'btags',
  'bvariations',
  'bvariations.bvariationtype',
  'bvariations.pvariations',
  'bvariations.pvariations.part',
  'bvariations.pvariations.specs',
]


const standardRelatedAll = [
  ...standardRelated,
  'comments',
  'bvariations.photos',
  // More?
]


const standardRelatedCompact = [
]


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Build
        .query((q) => {
          if (req.query.search) {
            q.where('name', 'LIKE', `%${req.query.search}%`)
          }
        })
        .fetchPage({
          pageSize: config.standardPageSize,
          page: req.query.page,
          withRelated: standardRelatedCompact,
        })
        .then(preparePaginatedResult)
      },
    },

    {
      method: methods.GET,
      getType: 'single',
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Build
        .where({ id: idMaybe })
        .fetch({
          require: true,
          withRelated: standardRelated,
        })
      },
    },

    {
      method: methods.POST,
      role: 'admin',
      schema,
      makeResponse({ bodyMaybe }) {
        // Forge new Build
        return Build
        .forge(_.omit(bodyMaybe, ['btags', 'bvariations']))
        .save()
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return Build
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: standardRelated,
        })
        .catch(catchNotFound())
        .then((build) => {
          build.set(bodyMaybe)
          return build.save()
        })
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Build
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: standardRelatedAll,
        })
        .catch(catchNotFound())
        .then((build) =>
          build.destroy({ require: true }))
        .then(() => null)
      },
    },
  ],
})
