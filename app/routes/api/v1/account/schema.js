import Joi from 'joi'

export default {
  email: Joi.string().email().required(),
  display: Joi.string().trim().min(3).required(),
  password: Joi.string().min(7).required(),

  // non-columns:
  password_confirmation: Joi.any().strip().valid(Joi.ref('password')).required()
    .options({ language: { any: { allowOnly: 'Passwords must match' } } }),
  password_login: Joi.string().required(),
}
