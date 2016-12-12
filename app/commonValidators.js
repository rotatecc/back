import Joi from 'joi'


export const stringNonTrivialTrimmed = Joi.string().trim().min(2)


export const id = Joi.number().positive().integer()


export const stringAllowEmptyTrimmed = Joi.string().trim().allow('')


export const modStatus = Joi.string().valid('non', 'approve', 'reject')
