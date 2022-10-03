import { Router } from "express";
import { getRentals, postRent } from "../controllers/rentController.js";

const rentRouter = Router();

rentRouter.get("/rentals", getRentals);
rentRouter.post("/rentals", postRent);

export { rentRouter };
