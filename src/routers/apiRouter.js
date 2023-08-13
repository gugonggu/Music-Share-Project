import express from "express";
import { musicDislike, musicLike } from "../controllers/musicController";

const apiRouter = express.Router();

apiRouter.post("/musics/:id([0-9a-f]{24})/dislike", musicDislike);
apiRouter.post("/musics/:id([0-9a-f]{24})/like", musicLike);

export default apiRouter;
