import Joi from 'joi'


const idSchema = Joi.number().positive().integer().required()

const stringAllowEmptySchema = Joi.string().allow('')

const specsSchema = Joi.array().items(Joi.object({ spec_id: idSchema, value: Joi.string().required() }))

export default {
  name: Joi.string().min(2).required(),
  manu_id: stringAllowEmptySchema.required(),
  manu_description: stringAllowEmptySchema.required(),
  our_note: stringAllowEmptySchema.required(),
  date_released: Joi.date().iso().allow('').required(),

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
