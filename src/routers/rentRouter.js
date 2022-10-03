import { Router } from "express";
import {
  deleteRent,
  finishRent,
  getRentals,
  postRent,
} from "../controllers/rentController.js";

const rentRouter = Router();

rentRouter.get("/rentals", getRentals);
rentRouter.post("/rentals", postRent);
rentRouter.post("/rentals/:id/return", finishRent);
rentRouter.delete("/rentals/:id", deleteRent);

export { rentRouter };
