import Joi from "joi";

export const signupSchema = Joi.object({
  name: Joi.string().min(5).required(),
  email: Joi.string().email().required(),
  telephone: Joi.string().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.name": "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character, and be at least 8 characters long.",
      "string.empty": "Password is required.",
    }),
});
