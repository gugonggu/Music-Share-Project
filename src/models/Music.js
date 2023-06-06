import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true},
    artist: {type: String, required: true, trim: true},
    musicSrc: {type: String, required: true, trim: true},
    genre: [{type: String, required: true, trim: true}],
    tags: [{type: String, required: true, trim: true}],
    recommender: {type: mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
    createdAt: {type: Date, required: true, default: Date.now}
});

musicSchema.static('formatTags', function(tags) {
    return tags.split(",").map((word) => word.startsWith('#') ? word : `${word}`)
});

musicSchema.static('formatGenre', function(genre) {
    return genre.split(",").map((word) => word ? word : `${word}`)
});

const Music = mongoose.model("Music", musicSchema);
export default Music;