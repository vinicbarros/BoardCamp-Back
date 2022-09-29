import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { categoriesRouter } from "./routers/categoriesRouter.js";
dotenv.config();

const app = express();

app.use(json());
app.use(cors());
app.use(categoriesRouter);

app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
