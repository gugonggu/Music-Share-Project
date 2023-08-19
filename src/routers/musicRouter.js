import express from "express";
import { protectorMiddleware } from "../middlewares";
import {
    getUpload,
    postUpload,
    listen,
    getEdit,
    postEdit,
    deleteMusic,
    getOthersPlaylist,
    postOthersPlaylist,
} from "../controllers/musicController";

const musicRouter = express.Router();

musicRouter.route("/:id([0-9a-f]{24})").all(protectorMiddleware).get(listen);
musicRouter
    .route("/:id([0-9a-f]{24})/edit")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(postEdit);
musicRouter
    .route("/:id([0-9a-f]{24})/delete")
    .all(protectorMiddleware)
    .get(deleteMusic);
musicRouter
    .route("/upload")
    .all(protectorMiddleware)
    .get(getUpload)
    .post(postUpload);
musicRouter
    .route("/others-playlist")
    .get(getOthersPlaylist)
    .post(postOthersPlaylist);

export default musicRouter;
