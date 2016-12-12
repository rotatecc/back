import Joi from 'joi'
import { stringNonTrivialTrimmed, stringAllowEmptyTrimmed, id } from 'commonValidators'


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


export default {
  name: stringNonTrivialTrimmed.required(),
  description: stringAllowEmptyTrimmed.required(),

  // belongsTo relations
  account_id: id.required(),

  // Complex relations
  btags: Joi.array().items(id.optional()).required(),
  bvariations: Joi.array().items(Joi.object().keys({
    id: id.optional(),
    name: stringNonTrivialTrimmed.required(),
    bvariationtype_id: id.required(),
    pvariations: Joi.array().items(id.optional()).required(),
  }).optional()).required(),
}
