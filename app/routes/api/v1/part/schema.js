import Joi from 'joi'
import { stringNonTrivialTrimmed, stringAllowEmptyTrimmed, id } from 'commonValidators'


const specsSchema = Joi.array().items(Joi.object().keys({
  id: id.optional(),
  name: Joi.string(),
  value: Joi.string().required(),
}).xor('id', 'name')) // Must contain exactly one of id, name

export default {
  name: stringNonTrivialTrimmed.required(),
  manu_id: stringAllowEmptyTrimmed.required(),
  manu_description: stringAllowEmptyTrimmed.required(),
  our_note: stringAllowEmptyTrimmed.required(),
  date_released: Joi.date().iso().allow(null).required(),

  // belongsTo relations
  ptype_id: id.required(),
  brand_id: id.required(),

  // Complex relations
  specs: specsSchema.required(),

  pvariations: Joi.array().items(Joi.object({
    id: id.optional(), // No id means new, otherwise, it's an update
    specs: specsSchema.required(),
  })).required(),
}
