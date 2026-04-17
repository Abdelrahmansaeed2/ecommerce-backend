
import express from "express";
import{
  createCategory,
  getallcategories,
  getcategory,
  updatecategory,
  deletecategory
} from "../controllers/categoreycontroller.js";

import {protect} from "../middlewares/authMiddleware.js";
import {authorize} from "../middlewares/roleMiddleware.js";

const router = express.Router();
router.get("/",getallcategories);
router.get("/:id",getcategory);
router.post("/",protect,authorize("admin"),createCategory);
router.put("/:id",protect,authorize("admin"),updatecategory);
router.delete("/:id",protect,authorize("admin"),deletecategory);

export default router;