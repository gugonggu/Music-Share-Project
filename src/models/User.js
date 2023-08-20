import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    musics: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
    musicLikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Music",
        },
    ],
    musicDislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Music",
        },
    ],
    musicListened: [
        {
            musicListenedId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Music",
            },
            count: { type: Number, default: 1 },
        },
    ],
    soundValue: { type: Number, default: 50, required: true },
});

userSchema.pre("save", async function () {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model("User", userSchema);

export default User;
