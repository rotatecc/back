import _ from 'lodash'
import Promise from 'bluebird'

import config from 'config'
import makeResource, { methods } from 'resource'
import { preparePaginatedResult, catchNotFound } from 'utils'

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
        return verifyDirectPartRelationsExist(bodyMaybe)
        .then(() =>
          // Forge new part
          Part
          .forge(_.omit(bodyMaybe, ['specs', 'pvariations']))
          .save())
        .then((part) =>
          preparePartDependencies(part, bodyMaybe))
        .then((part) =>
          // Everything went well,
          // so just return the new part with some fresh-loaded relations
          part.load(standardRelated))
      },
    },

    {
      method: methods.PUT,
      role: 'admin',
      schema,
      makeResponse({ idMaybe, bodyMaybe }) {
        return verifyDirectPartRelationsExist(bodyMaybe)
        .then(() =>
          // Find existing part
          Part
          .where('id', idMaybe)
          .fetch({
            require: true,
            withRelated: standardRelated,
          })
          .catch(catchNotFound()))
        .then((part) => {
          // Update the regular ol fields on the row
          part.set(_.omit(bodyMaybe, ['specs', 'pvariations']))
          return part.save()
        })
        .then((part) =>
          // Update Specs, PVariations, and PVariations.Specs
          preparePartDependencies(part, bodyMaybe))
        .then((part) =>
          // Everything went well,
          // so just return the new part with some fresh-loaded relations
          part.load(standardRelated))
      },
    },

    {
      method: methods.DELETE,
      role: 'admin',
      makeResponse({ idMaybe }) {
        return Part
        .where('id', idMaybe)
        .fetch({
          require: true,
          withRelated: standardRelatedAll,
        })
        .catch(catchNotFound())
        .then((part) => {
          // Destroy or detach related

          const removeRelatedPromises = []

          if (!part.related('specs').isEmpty()) {
            removeRelatedPromises.push(part.specs().detach())
          }

          if (!part.related('pvariations').isEmpty()) {
            const pvSpecDetachPromises = []

            part.related('pvariations').each((pv) => {
              if (!pv.related('specs').isEmpty()) {
                pvSpecDetachPromises.push(pv.specs().detach())
              }
            })

            const finalPVariationsPromise = Promise.all(pvSpecDetachPromises)
            .then(() =>
              Promise.all(part.related('pvariations').map((pv) =>
                pv.destroy())))

            removeRelatedPromises.push(finalPVariationsPromise)
          }

          if (!part.related('comments').isEmpty()) {
            removeRelatedPromises.push(Promise.all(part.related('comments').map((c) => c.destroy())))
          }

          if (!part.related('reviews').isEmpty()) {
            removeRelatedPromises.push(Promise.all(part.related('reviews').map((r) => r.destroy())))
          }

          return Promise.all(removeRelatedPromises)
          .then(() =>
            part.destroy({ require: true }))
        })
        .then(() => null)
      },
    },
  ],
})
