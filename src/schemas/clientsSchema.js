import Joi from "joi";

const clientsSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().min(10).max(11).required(),
  cpf: Joi.string().min(11).max(11).required(),
  birthday: Joi.date().format("YYYY-DD-MM").utc(),
});

export { clientsSchema };
