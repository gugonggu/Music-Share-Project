import express from "express";
import {
    musicDislike,
    musicLike,
    randomMusic,
    sameGenreMusic,
} from "../controllers/musicController";

const apiRouter = express.Router();

apiRouter.post("/musics/:id([0-9a-f]{24})/dislike", musicDislike);
apiRouter.post("/musics/:id([0-9a-f]{24})/like", musicLike);
apiRouter.get("/musics/:id([0-9a-f]{24})/random", randomMusic);
apiRouter.get("/musics/:id([0-9a-f]{24})/sameGenre", sameGenreMusic);

export default apiRouter;
