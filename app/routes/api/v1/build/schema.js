import Joi from 'joi'


/**
 * Standard POST/PUT body for Build:
 *
 * {
 *   name,
 *   description,
 *   btags: [1, 2, 3],
 *   bvariations: [
 *     // NOTE The BVariation 'order' field should be set to its index in this list
 *     {
 *       ?id, // If new, no id entry.
 *       name,
 *       bvariationtype_id,
 *       pvariations: [1, 2, 3]
 *     }
 *   ]
 * }
 */


const idSchema = Joi.number().positive().integer().required()

const stringAllowEmptySchema = Joi.string().allow('')

export default {
  name: Joi.string().min(2).required(),
  description: stringAllowEmptySchema.required(),

  // belongsTo relations
  account_id: idSchema,

  // Complex relations
  btags: Joi.array().items(idSchema.optional()).required(),
  bvariations: Joi.array().items(Joi.object().keys({
    id: idSchema.optional(),
    name: Joi.string().min(2).required(),
    bvariationtype_id: idSchema,
    pvariations: Joi.array().items(idSchema.optional()).required(),
  }).optional()).required(),
}
