import express from "express";
import {
    musicDislike,
    musicLike,
    randomMusic,
    sameGenreMusic,
    confirmLiked,
    postListenCount,
} from "../controllers/musicController";
import { getSound, postSound } from "../controllers/userController";
import { protectorMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.post("/musics/:id([0-9a-f]{24})/listened", postListenCount);
apiRouter.post("/musics/:id([0-9a-f]{24})/dislike", musicDislike);
apiRouter.post("/musics/:id([0-9a-f]{24})/like", musicLike);
apiRouter.get("/musics/:id([0-9a-f]{24})/random", randomMusic);
apiRouter.get("/musics/:id([0-9a-f]{24})/sameGenre", sameGenreMusic);
apiRouter.patch("/musics/:id([0-9a-f]{24})/confirmLiked", confirmLiked);
apiRouter
    .route("/users/:id([0-9a-f]{24})/sound")
    .all(protectorMiddleware)
    .get(getSound)
    .post(postSound);

export default apiRouter;
