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

const finishRent = async (req, res) => {
  const { id } = req.params;

  const isRentValid = await db.query(`SELECT * FROM rentals WHERE id = $1;`, [
    id,
  ]);

  if (!(isRentValid.rowCount > 0)) {
    return res.status(404).send({ message: "This id is not valid." });
  }

  let rentValid = isRentValid.rows[0];

  try {
    if (rentValid.returnDate) {
      return res
        .status(400)
        .send({ error: "Rental has already been finished" });
    }
    const now = dayjs();
    const diff = now.diff(rentValid.rentDate, "day");

    let taxes = 0;
    let mustPayTaxes = diff > rentValid.daysRented;
    if (mustPayTaxes) {
      taxes =
        (diff - rentValid.daysRented) *
        (rentValid.originalPrice / rentValid.daysRented);
    }
    await db.query(
      `UPDATE rentals 
    SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`,
      [dayjs(now).format("YYYY-MM-DD"), taxes, id]
    );
    res
      .status(200)
      .send({ message: "Returned the game to the store successfully." });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

const deleteRent = async (req, res) => {
  const { id } = req.params;

  const isRentValid = (
    await db.query(`SELECT * FROM rentals WHERE id = $1;`, [id])
  ).rows[0];

  if (!isRentValid || isRentValid.returnDate) {
    return res.status(404).send({
      message: "This rent has already been finished or the id isn't valid.",
    });
  }

  try {
    await db.query(`DELETE FROM rentals WHERE id = $1;`, [id]);
    return res.status(200).send({ message: "Rent deleted successfully." });
  } catch (error) {
    return res.status(400).send({ message: "An error ocurred." });
  }
};

export { getRentals, postRent, finishRent, deleteRent };
