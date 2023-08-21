import Music from "../models/Music";
import User from "../models/User";

export const home = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    // 유저 검색
    const user = await User.findById(_id).populate(
        "musicListened.musicListenedId"
    );
    if (!user) {
        return res.render("404", { pageTitle: "유저를 찾을 수 없습니다." });
    }

    // 랜덤 음악
    const allMusic = await Music.find();
    const randomMusicList = [];
    const randomLimit = allMusic.length < 7 ? allMusic.length : 7;
    while (randomMusicList.length < randomLimit) {
        const randomIndex = Math.floor(Math.random() * allMusic.length);
        if (randomMusicList.includes(allMusic[randomIndex])) {
            continue;
        }
        randomMusicList.push(allMusic[randomIndex]);
    }

    // 유저가 들었던 음악
    const userListenedMusics = [];
    const listenedLimit =
        user.musicListened.length < 7 ? user.musicListened.length : 7;
    for (let i = 0; userListenedMusics.length < listenedLimit; i++) {
        userListenedMusics.push(user.musicListened[i]);
    }

    return res.render("home", {
        pageTitle: "Home",
        randomMusicList,
        userListenedMusics,
    });
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
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    // 랜덤 트랙 리스트 구현 코드
    const allMusic = await Music.find().populate("recommender", "username");
    const randomMusicList = [];
    randomMusicList.push(music);
    const limit = allMusic.length < 9 ? allMusic.length : 9;
    while (randomMusicList.length < limit) {
        const randomIndex = Math.floor(Math.random() * allMusic.length);
        if (music._id.toString() === allMusic[randomIndex]._id.toString()) {
            continue;
        }
        if (randomMusicList.includes(allMusic[randomIndex])) {
            continue;
        }
        randomMusicList.push(allMusic[randomIndex]);
    }

    // 유저 좋아요 / 싫어요 확인
    const user = await User.findById(_id);
    let isLiked = null;
    if (user.musicLikes.includes(id)) {
        for (let i = 0; i < user.musicLikes.length; i++) {
            if (user.musicLikes[i].toString() === id.toString()) {
                user.musicLikes.splice(i, 1);
                i--;
            }
        }
        isLiked = true;
    } else if (user.musicDislikes.includes(id)) {
        for (let i = 0; i < user.musicDislikes.length; i++) {
            if (user.musicDislikes[i].toString() === id.toString()) {
                user.musicDislikes.splice(i, 1);
                i--;
            }
        }
        isLiked = false;
    }
    return res.render("musics/listen", {
        pageTitle: music.title,
        music: music,
        randomMusicList: randomMusicList,
        isLiked: isLiked,
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
        for (let i = 0; i < user.musicDislikes.length; i++) {
            if (user.musicDislikes[i].toString() === id.toString()) {
                user.musicDislikes.splice(i, 1);
                i--;
            }
        }
        user.save();
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
        for (let i = 0; i < user.musicLikes.length; i++) {
            if (user.musicLikes[i].toString() === id.toString()) {
                user.musicLikes.splice(i, 1);
                i--;
            }
        }
        user.save();
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

export const randomMusic = async (req, res) => {
    const { id } = req.params;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const allMusic = await Music.find().populate("recommender", "username");
    const limit = allMusic.length < 9 ? allMusic.length : 9;
    const randomMusicList = [];
    randomMusicList.push(music);
    while (randomMusicList.length < limit) {
        const randomIndex = Math.floor(Math.random() * allMusic.length);
        if (music._id.toString() === allMusic[randomIndex]._id.toString()) {
            continue;
        }
        if (randomMusicList.includes(allMusic[randomIndex])) {
            continue;
        }
        randomMusicList.push(allMusic[randomIndex]);
    }
    return res.status(200).json({ randomMusicList: randomMusicList });
};

export const sameGenreMusic = async (req, res) => {
    const { id } = req.params;
    const music = await Music.findById(id);
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const sameGenreList = await Music.find({ genre: music.genre }).populate(
        "recommender",
        "username"
    );
    sameGenreList.sort(() => Math.random() - 0.5);
    return res.status(200).json({ sameGenreList: sameGenreList });
};

export const confirmLiked = async (req, res) => {
    const {
        body: { loggedInUserId },
        params: { id },
    } = req;
    const user = await User.findById(loggedInUserId);
    let liked = null;
    if (user.musicLikes.includes(id)) {
        for (let i = 0; i < user.musicLikes.length; i++) {
            if (user.musicLikes[i].toString() === id.toString()) {
                user.musicLikes.splice(i, 1);
                i--;
            }
        }
        liked = true;
    } else if (user.musicDislikes.includes(id)) {
        for (let i = 0; i < user.musicDislikes.length; i++) {
            if (user.musicDislikes[i].toString() === id.toString()) {
                user.musicDislikes.splice(i, 1);
                i--;
            }
        }
        liked = false;
    }
    return res.status(200).json({ liked: liked });
};

export const postListenCount = async (req, res) => {
    const {
        body: { loggedInUserId },
        params: { id },
    } = req;
    const user = await User.findById(loggedInUserId);
    for (let i = 0; i < user.musicListened.length; i++) {
        if (
            user.musicListened[i].musicListenedId.toString() === id.toString()
        ) {
            user.musicListened[i].count++;
            user.save();
            return res.sendStatus(200);
        }
    }
    const obj = {
        musicListenedId: id,
        count: 1,
    };
    user.musicListened.push(obj);
    user.save();
    return res.sendStatus(200);
};

export const getMoreRandomMusic = async (req, res) => {
    const {
        body: { list },
    } = req;
    const allMusic = await Music.find();
    const randomMusicList = [];
    const randomLimit =
        allMusic.length < list.length ? list.length - allMusic.length : 7;
    while (randomMusicList.length < randomLimit) {
        const randomIndex = Math.floor(Math.random() * allMusic.length);
        if (
            randomMusicList.includes(allMusic[randomIndex]) ||
            list.includes(allMusic[randomIndex]._id.toString())
        ) {
            continue;
        }
        randomMusicList.push(allMusic[randomIndex]);
    }
    return res.status(200).json({ randomMusicList: randomMusicList });
};
