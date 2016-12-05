import Joi from 'joi'


export default {
  name: Joi.string().min(2).required(),
  manu_id: Joi.string().required(),
  manu_description: Joi.string().required(),
  our_note: Joi.string().required(),
  date_released: Joi.date().iso().required(),

  // relations
  ptype_id: Joi.number().positive().integer().required(),
  brand_id: Joi.number().positive().integer().required(),
}
