import Joi from 'joi';

export const envValidator = Joi.object().keys({
    NODE_ENV: Joi.string().required(),
    
    // dev db
    DEV_DB_PASSWORD: Joi.string().required(),
    DEV_DB_USER: Joi.string().required(),
    DEV_DB_NAME: Joi.string().required(),
    DEV_DB_PORT: Joi.string().required(),
    DEV_DB_HOST: Joi.string().required(),
    DEV_MAX_CONNECTIONS: Joi.string().required(),
}).unknown();