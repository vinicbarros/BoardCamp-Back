import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { categoriesRouter } from "./routers/categoriesRouter.js";
import { gamesRouter } from "./routers/gamesRouter.js";
import { clientsRouter } from "./routers/clientsRouter.js";
import { rentRouter } from "./routers/rentRouter.js";
dotenv.config();

const app = express();

app.use(json());
app.use(cors());
app.use(categoriesRouter);
app.use(gamesRouter);
app.use(clientsRouter);
app.use(rentRouter);

app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`);
});
