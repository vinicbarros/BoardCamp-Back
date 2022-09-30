import { Router } from "express";
import { getGames, postGame } from "../controllers/gamesController.js";

const gamesRouter = Router();

gamesRouter.post("/games", postGame);
gamesRouter.get("/games", getGames);

export { gamesRouter };
