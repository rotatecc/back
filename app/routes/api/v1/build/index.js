import _ from 'lodash'

import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { Build } from 'models'

import schema from './schema'
import { prepareBuildDependencies } from './buildHelpers'


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
      role: false,
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
      role: false,
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
        return transact((tmix) =>
          // Forge new Build
          Build
          .forge(_.omit(bodyMaybe, ['btags', 'bvariations']))
          .save(null, tmix)
          .then((build) =>
            prepareBuildDependencies(build, bodyMaybe, tmix))
          .then((build) =>
            // Everything went well,
            // so just return the new Build with some fresh-loaded relations
            build.load(standardRelated, tmix)))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          Build
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: standardRelated,
          })
          .catch(catchNotFoundOrConnError())
          .then((build) =>
            build.save(_.omit(bodyMaybe, ['btags', 'bvariations']), tmix))
          .then((build) =>
            prepareBuildDependencies(build, bodyMaybe, tmix))
          .then((build) =>
            // Everything went well,
            // so just return the Build with some fresh-loaded relations
            build.load(standardRelated, tmix)))
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          Build
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: standardRelatedAll,
          })
          .catch(catchNotFoundOrConnError())
          .then((build) =>
            build.destroy({ ...tmix, require: true }))
          .then(() => null))
      },
    },
  ],
})
