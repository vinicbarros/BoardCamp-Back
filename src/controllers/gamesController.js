import { gameSchema } from "../schemas/gameSchema.js";
import { db } from "../db/db.js";

const postGame = async (req, res) => {
  const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

  const validate = gameSchema.validate(
    { name, image, stockTotal, categoryId, pricePerDay },
    { abortEarly: false }
  );

  if (validate.error) {
    const error = validate.error.details.map((detail) => detail.message);
    return res.status(400).send(error);
  }

  try {
    const nameAlreadyExists =
      (await db.query(`SELECT * FROM games WHERE name = $1;`, [name]))
        .rowCount > 0;
    const categoryExists =
      (await db.query(`SELECT * FROM categories WHERE id = $1;`, [categoryId]))
        .rowCount > 0;

    if (nameAlreadyExists) {
      return res.status(409).send({ message: "This game already exists." });
    }

    if (!categoryExists) {
      return res.status(400).send({ message: "This category doesn't exist." });
    }

    await db.query(
      `INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`,
      [name, image, stockTotal, categoryId, pricePerDay]
    );
    return res.sendStatus(201);
  } catch (error) {
    return res
      .status(400)
      .send({ message: "An error ocurred creating the game." });
  }
};

const getGames = async (req, res) => {
  const { name } = req.query;
  console.log(name);

  try {
    if (name) {
      console.log("entrou aqui");
      const filteredGames = (
        await db.query(
          `SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON categories.id=games."categoryId" WHERE LOWER (games.name) LIKE $1;`,
          [`%${name.toLowerCase()}%`]
        )
      ).rows;
      return res.status(200).send(filteredGames);
    }

    const games = (
      await db.query(
        `SELECT games.*, categories.name as "categoryName" FROM games JOIN categories ON categories.id=games."categoryId";`
      )
    ).rows;
    return res.status(200).send(games);
  } catch (error) {
    return res
      .status(400)
      .send({ message: "An error ocurred getting the games." });
  }
};

export { postGame, getGames };
