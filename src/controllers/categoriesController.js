import { db } from "../db/db.js";

const getCategories = async (req, res) => {
  try {
    const categories = await db.query("SELECT * FROM categories");
    return res.status(200).send(categories.rows);
  } catch (error) {
    return res
      .status(404)
      .send({ message: "An error ocurred getting the categories." });
  }
};

const postCategory = async (req, res) => {
  const { name } = res.locals;

  try {
    const categoryAlreadyExists = await db.query(
      "SELECT * FROM categories WHERE name = $1",
      [name]
    );
    if (categoryAlreadyExists.rowCount > 0)
      return res.status(409).send({ message: "This category already exists." });

    await db.query("INSERT INTO categories (name) VALUES ($1)", [name]);
    return res.status(201).send({ message: "Category created." });
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};

export { getCategories, postCategory };
