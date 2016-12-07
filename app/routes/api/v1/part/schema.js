import Joi from 'joi'


const idSchema = Joi.number().positive().integer().required()

const stringAllowEmptySchema = Joi.string().allow('')

const specsSchema = Joi.array().items(Joi.object().keys({
  spec_id: idSchema.optional(),
  spec_name: Joi.string(),
  value: Joi.string().required()
}).xor('spec_id', 'spec_name')) // must contain exactly one of spec_id, spec_name

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
  specs: specsSchema,

  pvariations: Joi.array().items(Joi.object({
    pvariation_id: idSchema.optional(), // no id means new, otherwise, it's an update
    specs: specsSchema
  })),
}
