import { categorySchema } from "../schemas/categoriesSchema.js";

const categoryMiddleware = (req, res, next) => {
  const { name } = req.body;

  const validate = categorySchema.validate({ name }, { abortEarly: false });

  if (validate.error) {
    const error = validate.error.details.map((detail) => detail.message);
    return res.status(422).send(error);
  }
  res.locals.name = name;
  next();
};

export { categoryMiddleware };
