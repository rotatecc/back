import Joi from 'joi'


const idSchema = Joi.number().positive().integer().required()

const stringAllowEmptySchema = Joi.string().allow('')

export default {
  name: Joi.string().min(2).required(),
  description: stringAllowEmptySchema.required(),

  // belongsTo relations
  account_id: idSchema,

  // Complex relations
  // TODO
}
