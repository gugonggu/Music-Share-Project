import express from "express";

const musicRouter = express.Router();

musicRouter.get("/:id([0-9a-f]{24})");
musicRouter.route("/:id([0-9a-f]{24})/edit");
musicRouter.route("/:id([0-9a-f]{24})/delete");
musicRouter.route("/upload");

export default musicRouter;