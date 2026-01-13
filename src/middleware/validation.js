const Joi = require('joi');

const registerSchema = Joi.object({
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    programme: Joi.string().required(),
    experience_level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required()
});

const validateRegistration = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};

module.exports = { validateRegistration };
