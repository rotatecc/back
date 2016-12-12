import Joi from 'joi'


export default {
  modstatus: Joi.string().valid('non', 'approve', 'reject').required(),
}
