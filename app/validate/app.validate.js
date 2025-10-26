import Joi from "joi";

export const sessionSchema = Joi.object().keys({
    title: Joi.string().max(200).optional(),
});

export const experimentSchema = Joi.object().keys({
    prompt: Joi.string().trim().min(1).max(5000).required(),
    parameters: Joi.object().required(),
});