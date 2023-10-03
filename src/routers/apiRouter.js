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
    getMoreListenedMusic,
    getMusicsByWeather,
    getMoreWeatherMusics,
    getMoreTimeMusics,
} from "../controllers/musicController";
import { getSound, postSound } from "../controllers/userController";
import {
    getUserPlaylist,
    addMusicToPlaylist,
    deleteMusicFromPlaylist,
} from "../controllers/playlistController";
import { protectorMiddleware } from "../middlewares";

const apiRouter = express.Router();

apiRouter.get(
    "/playlist/getUserPlaylist",
    protectorMiddleware,
    getUserPlaylist
);

apiRouter.patch(
    "/musics/recommend-by-weather",
    protectorMiddleware,
    getMusicsByWeather
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
apiRouter.patch(
    "/musics/get-more-randommusic",
    protectorMiddleware,
    getMoreRandomMusic
);
apiRouter.patch(
    "/musics/get-more-listenedmusic",
    protectorMiddleware,
    getMoreListenedMusic
);
apiRouter.patch(
    "/musics/:id([0-9a-f]{24})/get-more-samegenremusic",
    protectorMiddleware,
    getMoreSameGenreMusic
);
apiRouter.patch(
    "/musics/get-more-weather-musics",
    protectorMiddleware,
    getMoreWeatherMusics
);
apiRouter.patch(
    "/musics/get-more-time-musics",
    protectorMiddleware,
    getMoreTimeMusics
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
apiRouter.post("/playlist/add", protectorMiddleware, addMusicToPlaylist);

apiRouter
    .route("/users/:id([0-9a-f]{24})/sound")
    .all(protectorMiddleware)
    .get(getSound)
    .post(postSound);

apiRouter.delete(
    "/playlist/:playlistId([0-9a-f]{24})/delete/:musicId([0-9a-f]{24})",
    protectorMiddleware,
    deleteMusicFromPlaylist
);

export default apiRouter;
