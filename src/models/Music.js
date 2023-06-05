import mongoose from "mongoose";

const musicSchema = new mongoose.Schema({
    title: {type: String, required: true, trim: true},
    genre: {type: String, required: true, trim: true},
    tags: [{type: String, required: true, trim: true}],
    recommeder: {type: String, required: true, trim: true},
});

musicSchema.static('formatTags', function(tags) {
    return tags.split(",").map((word) => word.startsWith('#') ? word : `${word}`)
});

const Music = mongoose.model("Music", musicSchema);
export default Music;