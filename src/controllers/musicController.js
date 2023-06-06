import { async } from "regenerator-runtime";
import Music from "../models/Music";
import User from "../models/User";

export const home = async(req, res) => {
    const musics = await Music.find({}).sort({createdAt: "desc"}).populate("recommender");
    return res.render("home", {pageTitle: "Home", musics});
};

export const getUpload = (req, res) => {
    return res.render("musics/upload", {pageTitle: "Upload Video"});
};

export const postUpload = async (req, res) => {
    const {user: {_id}} = req.session;
    const {title, artist, musicSrc, genre, tags} = req.body;

    try{
        const newMusic = await Music.create({
            title,
            artist,
            musicSrc,
            genre: Music.formatGenre(genre),
            recommender: _id,
            tags: Music.formatTags(tags)
        });
        const user = await User.findById(_id);
        user.musics.push(newMusic._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.status(400).render("musics/upload", {
            pageTitle: "Upload Music",
            errorMessage: error._message,
        });
    }
};

export const listen = async (req, res) => {
    const {id} = req.params;
    const music = await Music.findById(id).populate("recommender");
    if(!music){
        return res.render("404", {pageTitle: "음악을 찾을 수 없습니다."});
    }
    return res.render("musics/listen", {pageTitle: music.title, music: music});
};

export const getEdit = async (req, res) => {
    const {id} = req.params;
    const {user: {_id}} = req.session;
    const music = await Music.findById(id);
    if(!music){
        return res.status(400).render("404", {pageTitle: "Music not found."});
    }
    if(String(music.recommender) !== String(_id)){
        return res.status(403).redirect("/");
    }
    return res.render("edit", {pageTitle: `Edit: ${music.title}`, music});
};

export const postEdit = async (req, res) => {
    const {user: {_id}} = req.session;
    const {id} = req.params;
    const {title, artist, genre, tags} = req.body;
    const music = await Music.exists(id);
    if(!music){
        return res.status(404).render("404", {pageTitle: "Music not found."});
    }
    if(String(music.recommender) !== String(_id)){
        req.flash("error", "Not authorized");
        return res.status(403).redirect("/");
    }
    await Music.findByIdAndUpdate(id, {
        title,
        artist,
        genre,
        tags
    });
    req.flash("success", "Changes saved.");
    return res.redirect(`/music/${id}`);
};

export const deleteMusic = async (req, res) => {
    const {id} = req.params;
    const {user: {_id}} = req.session;
    const music = await Music.findById(id);
    if(!music){
        return res.status(404).render("404", {pageTitle: "Music not found."});
    }
    if(String(music.recommender) !== String(_id)){
        req.flash("error", "You are not the owner of the music.");
        return res.status(403).redirect("/");
    }
    const user = await User.findById(music.recommender);
    for (let i = 0; user.musics.length; i++){
        if (String(user.musics[i]) === String(music._id)){
            user.musics.splice(i, 1);
        }
    }
    await Music.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const {keyword} = req.query;
    let musics = [];
    if (keyword) {
        musics = await Music.find({
            title:{
                $regex: new RegExp(keyword, "i"),
            },
        }).populate("recommender");
    }
    return res.render("search", {pageTitle: "Search", musics});
};