import express from "express";
import {
    musicDislike,
    musicLike,
    randomMusic,
    sameGenreMusic,
    confirmLiked,
    postListenCount,
    getMoreRandomMusic,
    getMoreSameGenreMusic,
} from "../controllers/musicController";
import { getSound, postSound } from "../controllers/userController";
import { protectorMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.patch(
    "/musics/get-more-randommusic",
    protectorMiddleware,
    getMoreRandomMusic
);
apiRouter.patch(
    "/musics/:id([0-9a-f]{24})/get-more-samegenremusic",
    protectorMiddleware,
    getMoreSameGenreMusic
);

apiRouter.post(
    "/musics/:id([0-9a-f]{24})/listened",
    protectorMiddleware,
    postListenCount
);
apiRouter.post(
    "/musics/:id([0-9a-f]{24})/dislike",
    protectorMiddleware,
    musicDislike
);
apiRouter.post(
    "/musics/:id([0-9a-f]{24})/like",
    protectorMiddleware,
    musicLike
);
apiRouter.patch(
    "/musics/:id([0-9a-f]{24})/random",
    protectorMiddleware,
    randomMusic
);
apiRouter.patch(
    "/musics/:id([0-9a-f]{24})/sameGenre",
    protectorMiddleware,
    sameGenreMusic
);
apiRouter.patch(
    "/musics/:id([0-9a-f]{24})/confirmLiked",
    protectorMiddleware,
    confirmLiked
);
apiRouter
    .route("/users/:id([0-9a-f]{24})/sound")
    .all(protectorMiddleware)
    .get(getSound)
    .post(postSound);

export default apiRouter;
