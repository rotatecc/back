import Joi from 'joi'


export default {
  name: Joi.string().min(2).required()
}
