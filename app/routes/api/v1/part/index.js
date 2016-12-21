import _ from 'lodash'

import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFoundOrConnError } from 'utils'
import { transact } from 'db'

import { Part } from 'models'

import schema from './schema'
import { verifyDirectPartRelationsExist, preparePartDependencies } from './partHelpers'


const standardRelated = [
  'ptype',
  'brand',
  'specs',
  'pvariations',
  'pvariations.specs',
]


const standardRelatedAll = [
  ...standardRelated,
  'comments',
  'reviews',
]


const standardRelatedCompact = [
  'ptype',
  'brand',
]


export default makeResource({
  endpoints: [
    {
      method: methods.GET,
      getType: 'paginate',
      role: 'admin',
      makeResponse({ req }) {
        return Part
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
        return Part
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
          verifyDirectPartRelationsExist(bodyMaybe, tmix)
          .then(() =>
            // Forge new part
            Part
            .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
            .save(null, tmix))
          .then((part) =>
            preparePartDependencies(part, bodyMaybe, tmix))
          .then((part) =>
            // Everything went well,
            // so just return the new Part with some fresh-loaded relations
            part.load(standardRelated, tmix)))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return transact((tmix) =>
          verifyDirectPartRelationsExist(bodyMaybe, tmix)
          .then(() =>
            // Find existing part
            Part
            .where('id', idMaybe)
            .fetch({
              ...tmix,
              require: true,
              withRelated: standardRelated,
            })
            .catch(catchNotFoundOrConnError()))
          .then((part) =>
            // Update the regular ol fields on the row
            part.save(_.omit(bodyMaybe, ['specs', 'pvariations']), tmix))
          .then((part) =>
            // Update Specs, PVariations, and PVariations.Specs
            preparePartDependencies(part, bodyMaybe, tmix))
          .then((part) =>
            // Everything went well,
            // so just return the Part with some fresh-loaded relations
            part.load(standardRelated, tmix)))
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return transact((tmix) =>
          Part
          .where('id', idMaybe)
          .fetch({
            ...tmix,
            require: true,
            withRelated: standardRelatedAll,
          })
          .catch(catchNotFoundOrConnError())
          .then((part) =>
            part.destroy({ ...tmix, require: true }))
          .then(() => null))
      },
    },
  ],
})
