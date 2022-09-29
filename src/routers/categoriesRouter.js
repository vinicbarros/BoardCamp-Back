import { Router } from "express";
import {
  getCategories,
  postCategory,
} from "../controllers/categoriesController.js";
import { categoryMiddleware } from "../middlewares/categoriesMiddleware.js";

const categoriesRouter = Router();

categoriesRouter.get("/categories", getCategories);
categoriesRouter.post("/categories", categoryMiddleware, postCategory);

export { categoriesRouter };
