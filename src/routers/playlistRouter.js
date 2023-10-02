import express from "express";
import { protectorMiddleware } from "../middlewares";
import {
    getCreatePlaylist,
    postCreatePlaylist,
    getPlaylist,
    getDeletePlaylist,
    getPlaylistEdit,
    postPlaylistEdit,
} from "../controllers/playlistController";

const playlistRouter = express.Router();

playlistRouter
    .route("/create")
    .all(protectorMiddleware)
    .get(getCreatePlaylist)
    .post(postCreatePlaylist);
playlistRouter.get("/:id([0-9a-f]{24})", protectorMiddleware, getPlaylist);
playlistRouter.get(
    "/:id([0-9a-f]{24})/delete",
    protectorMiddleware,
    getDeletePlaylist
);
playlistRouter
    .route("/:id([0-9a-f]{24})/edit")
    .all(protectorMiddleware)
    .get(getPlaylistEdit)
    .post(postPlaylistEdit);

export default playlistRouter;
