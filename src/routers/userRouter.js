import express from "express";

const userRouter = express.Router();

userRouter.get("/logout");
userRouter.route("/edit");
userRouter.route("/change-password");
userRouter.get("/:id");

export default userRouter;