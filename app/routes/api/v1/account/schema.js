import Joi from 'joi'

export default {
  email: Joi.string().email(),
  display: Joi.string().trim().min(3),
  password: Joi.string().min(7).required(),
  password_confirmation: Joi.any().strip().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'Passwords must match' } } })
}
