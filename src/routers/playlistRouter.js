import express from "express";
import { protectorMiddleware } from "../middlewares";
import {
    getCreatePlaylist,
    postCreatePlaylist,
    getPlaylist,
} from "../controllers/playlistController";

const playlistRouter = express.Router();

playlistRouter
    .route("/create")
    .all(protectorMiddleware)
    .get(getCreatePlaylist)
    .post(postCreatePlaylist);
playlistRouter.get("/:id([0-9a-f]{24})", protectorMiddleware, getPlaylist);

export default playlistRouter;
