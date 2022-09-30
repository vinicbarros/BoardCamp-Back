import Joi from "joi";
import JoiDate from "@joi/date";

const joi = Joi.extend(JoiDate);

const clientsSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().min(10).max(11).required(),
  cpf: joi.string().min(11).max(11).required(),
  birthday: joi.date().format(`YYYY-MM-DD`).utc().required(),
});

export { clientsSchema };
