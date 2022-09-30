import { Router } from "express";
import {
  getClient,
  getClientById,
  postClient,
  updateClient,
} from "../controllers/clientsController.js";
import { clientMiddleware } from "../middlewares/clientMiddleware.js";

const clientsRouter = Router();

clientsRouter.get("/customers", getClient);
clientsRouter.get("/customers/:id", getClientById);
clientsRouter.post("/customers", clientMiddleware, postClient);
clientsRouter.put("/customers/:id", clientMiddleware, updateClient);

export { clientsRouter };
