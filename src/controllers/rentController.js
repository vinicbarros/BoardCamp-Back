import { rentalSchema } from "../schemas/rentalSchema.js";
import { db } from "../db/db.js";
import dayjs from "dayjs";

const postRent = async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;
  const validate = rentalSchema.validate(
    { customerId, gameId, daysRented },
    { abortEarly: false }
  );

  if (validate.error) {
    const error = validate.error.details.map((detail) => detail.message);
    return res.status(400).send(error);
  }

  const gameIsValid = (
    await db.query(`SELECT * FROM games WHERE id = $1;`, [gameId])
  ).rows[0];

  const clientIsValid = (
    await db.query(`SELECT * FROM customers WHERE id = $1;`, [customerId])
  ).rows[0];

  const gameIsAvailable = (
    await db.query(
      `SELECT * FROM rentals WHERE "returnDate" IS null AND "gameId" = $1;`,
      [gameId]
    )
  ).rows.length;

  if (!gameIsValid || !clientIsValid)
    return res.status(400).send({ message: "Game or client isn't valid." });

  if (gameIsValid.stockTotal == gameIsAvailable)
    return res
      .status(400)
      .send({ message: "This game isn't available to rent." });
  console.log(gameIsAvailable);
  try {
    await db.query(
      `INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        customerId,
        gameId,
        dayjs().format("YYYY-MM-DD"),
        daysRented,
        null,
        gameIsValid.pricePerDay * daysRented,
        null,
      ]
    );
    return res.status(201).send({ message: "Rental created." });
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const getRentals = async (req, res) => {
  const { customerId, gameId } = req.query;
  let phrase = ``;
  const vars = [];

  if (customerId && !gameId) {
    phrase = `WHERE rentals."customerId" = $1`;
    vars.push(customerId);
  }

  if (gameId && !customerId) {
    phrase = `WHERE rentals."gameId" = $1`;
    vars.push(gameId);
  }

  if (gameId && customerId) {
    phrase = `WHERE rentals."gameId" = $1 AND rentals."customerId" = $2`;
    vars.push(gameId, customerId);
  }

  try {
    const rentals = (
      await db.query(
        `SELECT rentals.*, json_build_object('id', customers.id, 'name', customers.name) AS customer,
    json_build_object('id', games.id, 'name', games.name, 'categoryId', games."categoryId", 'categoryName', categories.name) AS game FROM rentals
    JOIN customers ON customers.id = rentals."customerId"
    JOIN games ON games.id = rentals."gameId"
    JOIN categories ON categories.id = games."categoryId"
    ${phrase};
    `,
        vars
      )
    ).rows;
    return res.status(200).send(rentals);
  } catch (error) {
    return res
      .status(400)
      .send({ message: "An error ocurred getting the rentals." });
  }
};

export { getRentals, postRent };
