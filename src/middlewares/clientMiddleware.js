import { clientsSchema } from "../schemas/clientsSchema.js";

const clientMiddleware = (req, res, next) => {
  const { name, phone, cpf, birthday } = req.body;

  const validate = clientsSchema.validate(
    { name, phone, cpf, birthday },
    { abortEarly: false }
  );

  if (validate.error) {
    const error = validate.error.details.map((detail) => detail.message);
    return res.status(400).send(error);
  }
  res.locals.client = { name, phone, cpf, birthday };
  next();
};

export { clientMiddleware };
