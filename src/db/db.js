import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();

const { Pool } = pkg;

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export { db };
