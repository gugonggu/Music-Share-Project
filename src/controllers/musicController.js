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
    const cantMoreRandom = randomLimit < 7 ? true : false;

    // 유저가 들었던 음악
    const userListenedMusics = [];
    const listenedLimit =
        user.musicListened.length < 7 ? user.musicListened.length : 7;
    while (userListenedMusics.length < listenedLimit) {
        const randomIndex = Math.floor(
            Math.random() * user.musicListened.length
        );
        if (userListenedMusics.includes(user.musicListened[randomIndex])) {
            continue;
        }
        userListenedMusics.push(user.musicListened[randomIndex]);
    }
    const cantMoreListened = listenedLimit < 7 ? true : false;

    // 날씨 불러오기

    // 시간 불러오기
    const now = new Date();
    const hour = now.getHours();

    // 계절 (월) 불러오기
    const month = now.getMonth() + 1;

    return res.render("home", {
        pageTitle: "Home",
        randomMusicList,
        cantMoreRandom,
        userListenedMusics,
        cantMoreListened,
        hour,
        month,
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

    const allMusics = await Music.find();
    if (allMusics.findIndex((i) => i.title === title) !== -1) {
        if (
            allMusics[allMusics.findIndex((i) => i.title === title)].artist ===
            artist
        ) {
            return res.status(400).render("musics/upload", {
                pageTitle: "Upload Music",
                errorMessage: "이미 추천되어있는 음악입니다.",
            });
        }
    }

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
    const { re } = req.query;
    const { weather } = req.query;
    const { time } = req.query;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    let vList = [];
    const user = await User.findById(_id).populate(
        "musicListened.musicListenedId"
    );
    if (re) {
        vList.push(music);
        const limit = user.musicListened.length < 8 ? user.musicListened : 8;
        while (vList.length < limit) {
            const randomIndex = Math.floor(Math.random() * allMusic.length);
            if (music._id.toString() === allMusic[randomIndex]._id.toString()) {
                continue;
            }
            if (vList.includes(allMusic[randomIndex])) {
                continue;
            }
            vList.push(allMusic[randomIndex]);
        }
    } else if (weather) {
        vList.push(music);
        const rainy = ["Drizzle", "Rain"];
        const foggy = [
            "Mist",
            "Smoke",
            "Haze",
            "Dust",
            "Fog",
            "Sand",
            "Dust",
            "Ash",
            "Squall",
            "Tornado",
        ];
        const getMusicsAndReturn = (musicFound) => {
            const randomWeatherMusicList = [];
            let weatherLimit = 0;
            if (vList.length < musicFound.length) {
                if (musicFound.length - vList.length < 7) {
                    weatherLimit = musicFound.length - vList.length;
                } else {
                    weatherLimit = 7;
                }
            }
            while (randomWeatherMusicList.length < weatherLimit) {
                const randomIndex = Math.floor(
                    Math.random() * musicFound.length
                );
                if (
                    randomWeatherMusicList.includes(musicFound[randomIndex]) ||
                    vList[0]._id.toString() ===
                        musicFound[randomIndex]._id.toString()
                ) {
                    continue;
                }
                randomWeatherMusicList.push(musicFound[randomIndex]);
            }
            return { functionList: randomWeatherMusicList };
        };
        if (
            rainy.includes(weather) ||
            foggy.includes(weather) ||
            weather === "Clouds"
        ) {
            const musics = await Music.find({
                genre: {
                    $in: [
                        "발라드",
                        "포크/어쿠스틱",
                        "알앤비/소울",
                        "재즈",
                        "인디",
                        "클래식",
                        "뉴에이지",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(musics);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (weather === "Thunderstorm") {
            const musics = await Music.find({
                genre: {
                    $in: ["댄스/팝", "랩/힙합", "일렉트로닉", "락/메탈"],
                },
            });
            const { functionList } = getMusicsAndReturn(musics);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (weather === "Clear") {
            const musics = await Music.find({
                genre: {
                    $in: [
                        "발라드",
                        "댄스/팝",
                        "포크/어쿠스틱",
                        "랩/힙합",
                        "알앤비/소울",
                        "재즈",
                        "일렉트로닉",
                        "락/메탈",
                        "인디",
                        "J-POP",
                        "클래식",
                        "뉴에이지",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(musics);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (weather === "Snow") {
            const musics = await Music.find({
                genre: "캐롤",
            });
            const { functionList } = getMusicsAndReturn(musics);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        }
    } else if (time) {
    } else {
        // 랜덤 트랙 리스트 구현 코드
        const allMusic = await Music.find().populate("recommender", "username");
        vList.push(music);
        const limit = allMusic.length < 8 ? allMusic.length : 8;
        while (vList.length < limit) {
            const randomIndex = Math.floor(Math.random() * allMusic.length);
            if (music._id.toString() === allMusic[randomIndex]._id.toString()) {
                continue;
            }
            if (vList.includes(allMusic[randomIndex])) {
                continue;
            }
            vList.push(allMusic[randomIndex]);
        }
    }

    // 유저 좋아요 / 싫어요 확인
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
        vList: vList,
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

    const allUser = await User.find();
    for (let i = 0; i < allUser.length; i++) {
        const filteredUserListended = allUser[i].musicListened.filter(
            (value) => String(value.musicListenedId) !== String(id)
        );
        allUser[i].musicListened = filteredUserListended;
        await allUser[i].save();
    }
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
    const {
        body: { list },
        params: { id },
    } = req;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const allMusic = await Music.find().populate("recommender", "username");
    const limit = list.length;
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
    const {
        body: { list },
        params: { id },
    } = req;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const allSameGenreList = await Music.find({ genre: music.genre }).populate(
        "recommender",
        "username"
    );
    let sameGenreList = [];
    const sameGenreLimit =
        allSameGenreList.length < 8 ? allSameGenreList.length : 8;
    sameGenreList.push(music);
    while (sameGenreList.length < sameGenreLimit) {
        const randomIndex = Math.floor(Math.random() * allSameGenreList.length);
        if (
            music._id.toString() ===
            allSameGenreList[randomIndex]._id.toString()
        ) {
            continue;
        }
        if (sameGenreList.includes(allSameGenreList[randomIndex])) {
            continue;
        }
        sameGenreList.push(allSameGenreList[randomIndex]);
    }
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
        body: { list, param, loggedInUserId },
    } = req;
    let user;
    let allMusic;
    if (param) {
        if (param[0] === "re") {
            user = await User.findById(loggedInUserId).populate(
                "musicListened.musicListenedId"
            );
        } else if (param[0] === "weather") {
            const weather = param[1];
            const rainy = ["Drizzle", "Rain"];
            const foggy = [
                "Mist",
                "Smoke",
                "Haze",
                "Dust",
                "Fog",
                "Sand",
                "Dust",
                "Ash",
                "Squall",
                "Tornado",
            ];
            if (
                rainy.includes(weather) ||
                foggy.includes(weather) ||
                weather === "Clouds"
            ) {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "발라드",
                            "포크/어쿠스틱",
                            "알앤비/소울",
                            "재즈",
                            "인디",
                            "클래식",
                            "뉴에이지",
                        ],
                    },
                });
            } else if (weather === "Thunderstorm") {
                allMusic = await Music.find({
                    genre: {
                        $in: ["댄스/팝", "랩/힙합", "일렉트로닉", "락/메탈"],
                    },
                });
            } else if (weather === "Clear") {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "발라드",
                            "댄스/팝",
                            "포크/어쿠스틱",
                            "랩/힙합",
                            "알앤비/소울",
                            "재즈",
                            "일렉트로닉",
                            "락/메탈",
                            "인디",
                            "J-POP",
                            "클래식",
                            "뉴에이지",
                        ],
                    },
                });
            } else if (weather === "Snow") {
                allMusic = await Music.find({
                    genre: "캐롤",
                });
            }
        } else if (param[0] === "time") {
            console.log("시간");
        }
    } else {
        allMusic = await Music.find();
    }
    const randomMusicList = [];
    let randomLimit = 0;
    if (user) {
        if (list.length < user.musicListened.length) {
            if (user.musicListened.length - list.length < 7) {
                randomLimit = user.musicListened.length - list.length;
            } else {
                randomLimit = 7;
            }
        } else {
            return res.sendStatus(304);
        }
        while (randomMusicList.length < randomLimit) {
            const randomIndex = Math.floor(
                Math.random() * user.musicListened.length
            );
            if (
                randomMusicList.includes(
                    user.musicListened[randomIndex].musicListenedId
                ) ||
                list.includes(
                    user.musicListened[randomIndex].musicListenedId.toString()
                )
            ) {
                continue;
            }
            randomMusicList.push(user.musicListened[randomIndex]._id);
        }
    } else {
        if (list.length < allMusic.length) {
            if (allMusic.length - list.length < 7) {
                randomLimit = allMusic.length - list.length;
            } else {
                randomLimit = 7;
            }
        } else {
            return res.sendStatus(304);
        }
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
    }
    const isAll = randomLimit < 7 ? true : false;
    return res
        .status(200)
        .json({ randomMusicList: randomMusicList, isAll: isAll });
};

export const getMoreSameGenreMusic = async (req, res) => {
    const {
        body: { list },
        params: { id },
    } = req;
    const music = await Music.findById(id).populate("recommender", "username");
    if (!music) {
        return res.render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    const allSameGenreList = await Music.find({ genre: music.genre }).populate(
        "recommender",
        "username"
    );

    const sameGenreList = [];
    let sameGenreLimit = 0;
    if (list.length < allSameGenreList.length) {
        if (allSameGenreList.length - list.length < 7) {
            sameGenreLimit = allSameGenreList.length - list.length;
        } else {
            sameGenreLimit = 7;
        }
    } else {
        return res.sendStatus(304);
    }

    while (sameGenreList.length < sameGenreLimit) {
        const randomIndex = Math.floor(Math.random() * allSameGenreList.length);
        if (
            sameGenreList.includes(allSameGenreList[randomIndex]) ||
            list.includes(allSameGenreList[randomIndex]._id.toString())
        ) {
            continue;
        }
        sameGenreList.push(allSameGenreList[randomIndex]);
    }
    const isAll = sameGenreLimit < 7 ? true : false;
    return res.status(200).json({ sameGenreList: sameGenreList, isAll: isAll });
};

export const getMoreListenedMusic = async (req, res) => {
    const {
        body: { list },
        session: {
            user: { _id },
        },
    } = req;
    const user = await User.findById(_id).populate(
        "musicListened.musicListenedId"
    );
    if (!user) {
        return res.render("404", { pageTitle: "유저를 찾을 수 없습니다." });
    }
    const listenedList = [];
    let listenedLimit = 0;
    if (list.length < user.musicListened.length) {
        if (user.musicListened.length - list.length < 7) {
            listenedLimit = user.musicListened.length - list.length;
        } else {
            listenedLimit = 7;
        }
    } else {
        return res.sendStatus(304);
    }
    while (listenedList.length < listenedLimit) {
        const randomIndex = Math.floor(
            Math.random() * user.musicListened.length
        );
        if (
            listenedList.includes(
                user.musicListened[randomIndex].musicListenedId
            ) ||
            list.includes(
                user.musicListened[randomIndex].musicListenedId._id.toString()
            )
        ) {
            continue;
        }
        listenedList.push(user.musicListened[randomIndex].musicListenedId);
    }
    const isAll = listenedLimit < 7 ? true : false;
    return res.status(200).json({ listenedList: listenedList, isAll: isAll });
};

export const getMusicsByWeather = async (req, res) => {
    const {
        body: { weather, list },
    } = req;
    const rainy = ["Drizzle", "Rain"];
    const foggy = [
        "Mist",
        "Smoke",
        "Haze",
        "Dust",
        "Fog",
        "Sand",
        "Dust",
        "Ash",
        "Squall",
        "Tornado",
    ];
    const getMusicsAndReturn = (musicFound) => {
        const randomWeatherMusicList = [];
        let weatherLimit = 0;
        if (list.length < musicFound.length) {
            if (musicFound.length - list.length < 7) {
                weatherLimit = musicFound.length - list.length;
            } else {
                weatherLimit = 7;
            }
        } else {
            return res.sendStatus(304);
        }
        while (randomWeatherMusicList.length < weatherLimit) {
            const randomIndex = Math.floor(Math.random() * musicFound.length);
            if (
                randomWeatherMusicList.includes(musicFound[randomIndex]) ||
                list.includes(musicFound[randomIndex]._id.toString())
            ) {
                continue;
            }
            randomWeatherMusicList.push(musicFound[randomIndex]);
        }
        const isAll = weatherLimit < 7 ? true : false;
        return { functionList: randomWeatherMusicList, functionAll: isAll };
    };
    if (
        rainy.includes(weather) ||
        foggy.includes(weather) ||
        weather === "Clouds"
    ) {
        const musics = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "포크/어쿠스틱",
                    "알앤비/소울",
                    "재즈",
                    "인디",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        const weatherTitleValue =
            weather === "Clouds" ? "흐린 날씨엔" : "비가 오는 하루";
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
            weatherTitleValue: weatherTitleValue,
        });
    } else if (weather === "Thunderstorm") {
        const musics = await Music.find({
            genre: {
                $in: ["댄스/팝", "랩/힙합", "일렉트로닉", "락/메탈"],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        const weatherTitleValue = "천둥도 덮어버릴 신나는 음악";
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
            weatherTitleValue: weatherTitleValue,
        });
    } else if (weather === "Clear") {
        const musics = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "포크/어쿠스틱",
                    "랩/힙합",
                    "알앤비/소울",
                    "재즈",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "J-POP",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        const weatherTitleValue = "어떤 음악을 들어도 좋은 맑은 날";
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
            weatherTitleValue: weatherTitleValue,
        });
    } else if (weather === "Snow") {
        const musics = await Music.find({
            genre: "캐롤",
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        const weatherTitleValue = "눈 오는 날엔 캐롤";
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
            weatherTitleValue: weatherTitleValue,
        });
    } else {
        const functionList = [];
        const functionAll = true;
        const weatherTitleValue = "날씨 정보 수집에 오류가 발생했습니다";
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
            weatherTitleValue: weatherTitleValue,
        });
    }
};

export const getMoreWeatherMusics = async (req, res) => {
    const {
        body: { list, weather },
    } = req;
    const rainy = ["Drizzle", "Rain"];
    const foggy = [
        "Mist",
        "Smoke",
        "Haze",
        "Dust",
        "Fog",
        "Sand",
        "Dust",
        "Ash",
        "Squall",
        "Tornado",
    ];
    const getMusicsAndReturn = (musicFound) => {
        const randomWeatherMusicList = [];
        let weatherLimit = 0;
        if (list.length < musicFound.length) {
            if (musicFound.length - list.length < 7) {
                weatherLimit = musicFound.length - list.length;
            } else {
                weatherLimit = 7;
            }
        } else {
            return res.sendStatus(304);
        }
        while (randomWeatherMusicList.length < weatherLimit) {
            const randomIndex = Math.floor(Math.random() * musicFound.length);
            if (
                randomWeatherMusicList.includes(musicFound[randomIndex]) ||
                list.includes(musicFound[randomIndex]._id.toString())
            ) {
                continue;
            }
            randomWeatherMusicList.push(musicFound[randomIndex]);
        }
        const isAll = weatherLimit < 7 ? true : false;
        return { functionList: randomWeatherMusicList, functionAll: isAll };
    };
    if (
        rainy.includes(weather) ||
        foggy.includes(weather) ||
        weather === "Clouds"
    ) {
        const musics = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "포크/어쿠스틱",
                    "알앤비/소울",
                    "재즈",
                    "인디",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
        });
    } else if (weather === "Thunderstorm") {
        const musics = await Music.find({
            genre: {
                $in: ["댄스/팝", "랩/힙합", "일렉트로닉", "락/메탈"],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
        });
    } else if (weather === "Clear") {
        const musics = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "포크/어쿠스틱",
                    "랩/힙합",
                    "알앤비/소울",
                    "재즈",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "J-POP",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
        });
    } else if (weather === "Snow") {
        const musics = await Music.find({
            genre: "캐롤",
        });
        const { functionList, functionAll } = getMusicsAndReturn(musics);
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
        });
    } else {
        const functionList = [];
        const functionAll = true;
        return res.status(200).json({
            randomWeatherMusicList: functionList,
            isAll: functionAll,
        });
    }
};
