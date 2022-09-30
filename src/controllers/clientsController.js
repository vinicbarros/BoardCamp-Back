import { db } from "../db/db.js";

const postClient = async (req, res) => {
  const { name, phone, cpf, birthday } = res.locals.client;

  try {
    const clientAlreadySignUp =
      (await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]))
        .rowCount > 0;

    if (clientAlreadySignUp) {
      return res.status(409).send({ message: "cpf already in use." });
    }

    await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`,
      [name, phone, cpf, birthday]
    );
    return res.sendStatus(201);
  } catch (error) {
    return res
      .status(400)
      .send({ message: "An error ocurred creating client." });
  }
};

const getClient = async (req, res) => {
  const { cpf } = req.query;

  try {
    if (cpf) {
      const searchCpf = (
        await db.query(`SELECT * FROM customers WHERE cpf LIKE $1;`, [
          `%${cpf}%`,
        ])
      ).rows;
      return res.status(200).send(searchCpf);
    }
    const clients = (await db.query(`SELECT * FROM customers;`)).rows;
    return res.status(200).send(clients);
  } catch (error) {
    return res
      .status(400)
      .send({ message: "An error ocurred getting the clients." });
  }
};

const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const clientById = await db.query(
      `SELECT * FROM customers WHERE id = $1;`,
      [id]
    );
    if (clientById.rowCount == 0) {
      return res.status(404).send({ message: "This id isn't valid." });
    }
    return res.status(200).send(clientById.rows);
  } catch (error) {
    return res.status(404).send({ message: "This id isn't valid." });
  }
};

const updateClient = async (req, res) => {
  const { name, phone, cpf, birthday } = res.locals.client;
  const { id } = req.params;

  try {
    const isIdValid =
      (await db.query(`SELECT * FROM customers WHERE id = $1;`, [id]))
        .rowCount == 0;

    const isCpfInUse =
      (await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]))
        .rowCount > 0;

    if (isIdValid || isCpfInUse) {
      return res.status(409).send({ message: "cpf or id invalid." });
    }

    await db.query(
      `UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`,
      [name, phone, cpf, birthday, id]
    );
    return res.sendStatus(200);
  } catch (error) {
    return res.sendStatus(400);
  }
};

export { postClient, getClient, getClientById, updateClient };
