import express from "express";
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";
import {
    logout,
    getEdit,
    postEdit,
    getChangePassword,
    postChangePassword,
    myMusics,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter
    .route("/edit-profile")
    .all(protectorMiddleware)
    .get(getEdit)
    .post(postEdit);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/:id", protectorMiddleware, myMusics);

export default userRouter;
