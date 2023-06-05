import express from "express";
import { home } from "../controllers/musicController";

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join")
rootRouter.route("/login")
rootRouter.get("/search");

export default rootRouter;