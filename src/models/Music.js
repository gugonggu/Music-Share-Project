import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    musicInfo: {
        musicUrl: { type: String, required: true, trim: true },
        musicId: { type: String, required: true, trim: true },
        musicSrc: { type: String, required: true, trim: true },
        musicThumbnailSrc: { type: String, required: true, trim: true },
    },
    genre: { type: String, required: true, trim: true },
    recommender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    createdAt: { type: Date, required: true, default: Date.now },
});

musicSchema.static("getYoutubeVideoId", function (url) {
    const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
        return match[2];
    }
    return "";
});

const Music = mongoose.model("Music", musicSchema);
export default Music;
