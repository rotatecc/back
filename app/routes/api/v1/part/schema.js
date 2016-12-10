import Joi from 'joi'


const idSchema = Joi.number().positive().integer().required()

const stringAllowEmptySchema = Joi.string().allow('')

const specsSchema = Joi.array().items(Joi.object().keys({
  id: idSchema.optional(),
  name: Joi.string(),
  value: Joi.string().required(),
}).xor('id', 'name')) // Must contain exactly one of id, name

export default {
  name: Joi.string().min(2).required(),
  manu_id: stringAllowEmptySchema.required(),
  manu_description: stringAllowEmptySchema.required(),
  our_note: stringAllowEmptySchema.required(),
  date_released: Joi.date().iso().allow(null).required(),

  // belongsTo relations
  ptype_id: idSchema,
  brand_id: idSchema,

  // Complex relations
  specs: specsSchema.required(),

  pvariations: Joi.array().items(Joi.object({
    id: idSchema.optional(), // No id means new, otherwise, it's an update
    specs: specsSchema.required(),
  })).required(),
}
