import express from "express";
import { protectorMiddleware  } from "../middlewares";
import { getUpload, postUpload, listen, getEdit, postEdit, deleteMusic } from "../controllers/musicController";

const musicRouter = express.Router();

musicRouter.get("/:id([0-9a-f]{24})", listen);
musicRouter.route("/:id([0-9a-f]{24})/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
musicRouter.route("/:id([0-9a-f]{24})/delete").all(protectorMiddleware).get(deleteMusic);
musicRouter.route("/upload").all(protectorMiddleware).get(getUpload).post(postUpload);

export default musicRouter;