import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    meta: {
        createdAt: { type: Date, required: true, default: Date.now },
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    list: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
});

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
