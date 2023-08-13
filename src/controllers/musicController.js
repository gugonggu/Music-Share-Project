import { async } from "regenerator-runtime";
import Music from "../models/Music";
import User from "../models/User";

export const home = async (req, res) => {
    const musics = await Music.find({})
        .sort({ createdAt: "desc" })
        .populate("recommender");
    return res.render("home", { pageTitle: "Home", musics });
};

export const getUpload = (req, res) => {
    return res.render("musics/upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const { title, artist, musicUrl, genre } = req.body;

    const youtubeVideoId = Music.getYoutubeVideoId(musicUrl);

    try {
        const newMusic = await Music.create({
            title,
            artist,
            musicInfo: {
                musicUrl: musicUrl,
                musicId: youtubeVideoId,
                musicSrc: `https://www.youtube.com/embed/${youtubeVideoId}`,
                musicThumbnailSrc: `https://img.youtube.com/vi/${youtubeVideoId}/maxres2.jpg`,
            },
            genre: genre,
            recommender: _id,
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
    const { id } = req.params;
    const music = await Music.findById(id).populate("recommender");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const allMusic = await Music.find().populate("recommender");
    const randomMusicList = [...allMusic];
    for (let i = randomMusicList.length - 1; i > 0; i--) {
        const randomPosition = Math.floor(Math.random() * (i + 1));
        const temp = randomMusicList[i];
        randomMusicList[i] = randomMusicList[randomPosition];
        randomMusicList[randomPosition] = temp;
    }
    return res.render("musics/listen", {
        pageTitle: music.title,
        music: music,
        randomMusicList: randomMusicList,
    });
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res.status(400).render("404", { pageTitle: "Music not found." });
    }
    if (String(music.recommender) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("musics/edit", {
        pageTitle: `Edit: ${music.title}`,
        music,
    });
};

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, artist, musicUrl, genre } = req.body;
    const music = await Music.exists({ _id: id });
    if (!music) {
        return res.status(404).render("404", { pageTitle: "Music not found." });
    }

    const youtubeVideoId = Music.getYoutubeVideoId(musicUrl);

    await Music.findByIdAndUpdate(id, {
        title,
        artist,
        musicInfo: {
            musicUrl: musicUrl,
            musicId: youtubeVideoId,
            musicSrc: `https://www.youtube.com/embed/${youtubeVideoId}`,
            musicThumbnailSrc: `https://img.youtube.com/vi/${youtubeVideoId}/maxres2.jpg`,
        },
        genre: genre,
    });
    req.flash("success", "Changes saved.");
    return res.redirect(`/music/${id}`);
};

export const deleteMusic = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res.status(404).render("404", { pageTitle: "Music not found." });
    }
    if (String(music.recommender) !== String(_id)) {
        req.flash("error", "You are not the owner of the music.");
        return res.status(403).redirect("/");
    }
    const user = await User.findById(music.recommender);
    const filteredUserMusic = user.musics.filter(
        (value) => String(value) !== String(id)
    );
    user.musics = filteredUserMusic;
    await user.save();
    await Music.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    const { titleKeyword, artistKeyword, genreKeyword } = req.query;
    let musics = [];
    if (titleKeyword) {
        musics = await Music.find({
            title: {
                $regex: new RegExp(titleKeyword, "i"),
            },
        }).populate("recommender");
    }
    if (artistKeyword) {
        musics = await Music.find({
            artist: {
                $regex: new RegExp(artistKeyword, "i"),
            },
        }).populate("recommender");
    }
    if (genreKeyword) {
        musics = await Music.find({
            artist: {
                $regex: new RegExp(genreKeyword, "i"),
            },
        }).populate("recommender");
    }
    return res.render("search", { pageTitle: "Search", musics });
};

export const getOthersPlaylist = async (req, res) => {
    const users = await User.find().populate("musics");
    return res.render("musics/others-playlist", {
        pageTitle: "Other's Playlist",
        users,
    });
};

export const postOthersPlaylist = async (req, res) => {
    return res.end();
};

export const musicDislike = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res.sendStatus(404);
    }
    const user = await User.findById(_id);
    if (user.musicDislikes.includes(id)) {
        return res.sendStatus(304);
    }
    if (user.musicLikes.includes(id)) {
        for (let i = 0; i < user.musicLikes.length; i++) {
            if (user.musicLikes[i].toString() === id.toString()) {
                user.musicLikes.splice(i, 1);
                i--;
            }
        }
    }
    user.musicDislikes.push(id);
    user.save();
    return res.sendStatus(200);
};

export const musicLike = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res.sendStatus(404);
    }
    const user = await User.findById(_id);
    if (user.musicLikes.includes(id)) {
        return res.sendStatus(304);
    }
    if (user.musicDislikes.includes(id)) {
        for (let i = 0; i < user.musicDislikes.length; i++) {
            if (user.musicDislikes[i].toString() === id.toString()) {
                user.musicDislikes.splice(i, 1);
                i--;
            }
        }
    }
    user.musicLikes.push(id);
    user.save();
    return res.sendStatus(200);
};
