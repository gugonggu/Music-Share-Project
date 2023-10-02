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
        return res.render("404", {
            pageTitle: "유저를 찾을 수 없습니다.",
        });
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
        user.musicListened.length < 9 ? user.musicListened.length : 9;
    while (userListenedMusics.length < listenedLimit) {
        const randomIndex = Math.floor(
            Math.random() * user.musicListened.length
        );
        if (userListenedMusics.includes(user.musicListened[randomIndex])) {
            continue;
        }
        userListenedMusics.push(user.musicListened[randomIndex]);
    }
    const cantMoreListened = listenedLimit < 9 ? true : false;

    // 시간 불러오기
    const now = new Date();
    const hour = now.getHours();
    let timeList = [];
    let timeTitle;
    const setLimitAndPushReturn = (musicFound) => {
        const timeLimit = musicFound.length < 7 ? musicFound.length : 7;
        while (timeList.length < timeLimit) {
            const randomIndex = Math.floor(Math.random() * musicFound.length);
            if (timeList.includes(musicFound[randomIndex])) {
                continue;
            }
            timeList.push(musicFound[randomIndex]);
        }
    };

    if (1 <= hour && hour < 6) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: ["발라드", "포크/어쿠스틱", "알앤비/소울", "재즈"],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
        timeTitle = "새벽 갬성";
    } else if (6 <= hour && hour < 10) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "댄스/팝",
                    "랩/힙합",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
        timeTitle = "개운한 아침";
    } else if (10 <= hour && hour < 16) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "포크/어쿠스틱",
                    "알앤비/소울",
                    "재즈",
                    "인디",
                    "J-POP",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
        timeTitle = "나른한 오후";
    } else if (16 <= hour && hour < 21) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "랩/힙합",
                    "알앤비/소울",
                    "일렉트로닉",
                    "락/메탈",
                    "재즈",
                    "인디",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
        timeTitle = "언제나 기분 좋은 퇴근길";
    } else {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "포크/어쿠스틱",
                    "랩/힙합",
                    "알앤비/소울",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "재즈",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
        timeTitle = "드라이브하고 싶은 밤";
    }

    // 계절 (월) 불러오기
    const month = now.getMonth() + 1;

    return res.render("home", {
        pageTitle: "Home",
        randomMusicList,
        cantMoreRandom,
        userListenedMusics,
        cantMoreListened,
        timeList,
        timeTitle,
        hour,
        month,
    });
};

export const getUpload = (req, res) => {
    return res.render("musics/upload", { pageTitle: "음악 추천" });
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
            pageTitle: "음악 추천",
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
        return res.render("404", {
            pageTitle: "음악을 찾을 수 없습니다.",
        });
    }
    let vList = [];
    const user = await User.findById(_id).populate(
        "musicListened.musicListenedId"
    );
    if (re) {
        vList.push(music);
        const limit =
            user.musicListened.length < 8 ? user.musicListened.length : 8;
        while (vList.length < limit) {
            const randomIndex = Math.floor(
                Math.random() * user.musicListened.length
            );
            if (
                music._id.toString() ===
                user.musicListened[randomIndex].musicListenedId._id.toString()
            ) {
                continue;
            }
            if (
                vList.includes(user.musicListened[randomIndex].musicListenedId)
            ) {
                continue;
            }
            vList.push(user.musicListened[randomIndex].musicListenedId);
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
        vList.push(music);
        const getMusicsAndReturn = (musicFound) => {
            const randomTimeMusicList = [];
            let timeLimit = 0;
            if (vList.length < musicFound.length) {
                if (musicFound.length - vList.length < 7) {
                    timeLimit = musicFound.length - vList.length;
                } else {
                    timeLimit = 7;
                }
            }
            while (randomTimeMusicList.length < timeLimit) {
                const randomIndex = Math.floor(
                    Math.random() * musicFound.length
                );
                if (
                    randomTimeMusicList.includes(musicFound[randomIndex]) ||
                    vList[0]._id.toString() ===
                        musicFound[randomIndex]._id.toString()
                ) {
                    continue;
                }
                randomTimeMusicList.push(musicFound[randomIndex]);
            }
            return { functionList: randomTimeMusicList };
        };
        if (1 <= time && time < 6) {
            const allTimeMusic = await Music.find({
                genre: {
                    $in: ["발라드", "포크/어쿠스틱", "알앤비/소울", "재즈"],
                },
            });
            const { functionList } = getMusicsAndReturn(allTimeMusic);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (6 <= time && time < 10) {
            const allTimeMusic = await Music.find({
                genre: {
                    $in: [
                        "댄스/팝",
                        "랩/힙합",
                        "일렉트로닉",
                        "락/메탈",
                        "인디",
                        "J-POP",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(allTimeMusic);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (10 <= time && time < 16) {
            const allTimeMusic = await Music.find({
                genre: {
                    $in: [
                        "발라드",
                        "포크/어쿠스틱",
                        "알앤비/소울",
                        "재즈",
                        "인디",
                        "J-POP",
                        "클래식",
                        "뉴에이지",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(allTimeMusic);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else if (16 <= time && time < 21) {
            const allTimeMusic = await Music.find({
                genre: {
                    $in: [
                        "발라드",
                        "댄스/팝",
                        "랩/힙합",
                        "알앤비/소울",
                        "일렉트로닉",
                        "락/메탈",
                        "재즈",
                        "인디",
                        "J-POP",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(allTimeMusic);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        } else {
            const allTimeMusic = await Music.find({
                genre: {
                    $in: [
                        "발라드",
                        "댄스/팝",
                        "포크/어쿠스틱",
                        "랩/힙합",
                        "알앤비/소울",
                        "일렉트로닉",
                        "락/메탈",
                        "인디",
                        "재즈",
                        "J-POP",
                    ],
                },
            });
            const { functionList } = getMusicsAndReturn(allTimeMusic);
            for (let i in functionList) {
                vList.push(functionList[i]);
            }
        }
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

    // 유저 플레이리스트
    const userPlaylistPopulate = await User.findById(_id).populate("playlists");
    const userPlaylists = userPlaylistPopulate.playlists;

    return res.render("musics/listen", {
        pageTitle: music.title,
        music: music,
        vList: vList,
        isLiked: isLiked,
        re: re,
        userPlaylists: userPlaylists,
    });
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res
            .status(400)
            .render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    if (String(music.recommender) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    return res.render("musics/edit", {
        pageTitle: `${music.title} 수정`,
        music,
    });
};

export const postEdit = async (req, res) => {
    const { id } = req.params;
    const { title, artist, musicUrl, genre } = req.body;
    const music = await Music.exists({ _id: id });
    if (!music) {
        return res
            .status(404)
            .render("404", { pageTitle: "음악을 찾을 수 없습니다." });
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
    req.flash("success", "변경사항이 저장되었습니다.");
    return res.redirect(`/music/${id}`);
};

export const deleteMusic = async (req, res) => {
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const music = await Music.findById(id);
    if (!music) {
        return res
            .status(404)
            .render("404", { pageTitle: "음악을 찾을 수 없습니다." });
    }
    if (String(music.recommender) !== String(_id)) {
        req.flash("error", "해당 음악의 추천인이 아닙니다.");
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
            genre: {
                $regex: new RegExp(genreKeyword, "i"),
            },
        }).populate("recommender");
    }
    return res.render("search", { pageTitle: "Search", musics });
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
        return res.render("404", {
            pageTitle: "음악을 찾을 수 없습니다.",
        });
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
        return res.render("404", {
            pageTitle: "음악을 찾을 수 없습니다.",
        });
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
            const hour = param[1];
            if (1 <= hour && hour < 6) {
                allMusic = await Music.find({
                    genre: {
                        $in: ["발라드", "포크/어쿠스틱", "알앤비/소울", "재즈"],
                    },
                });
            } else if (6 <= hour && hour < 10) {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "댄스/팝",
                            "랩/힙합",
                            "일렉트로닉",
                            "락/메탈",
                            "인디",
                            "J-POP",
                        ],
                    },
                });
            } else if (10 <= hour && hour < 16) {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "발라드",
                            "포크/어쿠스틱",
                            "알앤비/소울",
                            "재즈",
                            "인디",
                            "J-POP",
                            "클래식",
                            "뉴에이지",
                        ],
                    },
                });
            } else if (16 <= hour && hour < 21) {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "발라드",
                            "댄스/팝",
                            "랩/힙합",
                            "알앤비/소울",
                            "일렉트로닉",
                            "락/메탈",
                            "재즈",
                            "인디",
                            "J-POP",
                        ],
                    },
                });
            } else {
                allMusic = await Music.find({
                    genre: {
                        $in: [
                            "발라드",
                            "댄스/팝",
                            "포크/어쿠스틱",
                            "랩/힙합",
                            "알앤비/소울",
                            "일렉트로닉",
                            "락/메탈",
                            "인디",
                            "재즈",
                            "J-POP",
                        ],
                    },
                });
            }
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
            randomMusicList.push(
                user.musicListened[randomIndex].musicListenedId
            );
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
        return res.render("404", {
            pageTitle: "음악을 찾을 수 없습니다.",
        });
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
        return res.render("404", {
            pageTitle: "유저를 찾을 수 없습니다.",
        });
    }
    const listenedList = [];
    let listenedLimit = 0;
    if (list.length < user.musicListened.length) {
        if (user.musicListened.length - list.length < 9) {
            listenedLimit = user.musicListened.length - list.length;
        } else {
            listenedLimit = 9;
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
    const isAll = listenedLimit < 9 ? true : false;
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

export const getMoreTimeMusics = async (req, res) => {
    const {
        body: { curTimeList },
    } = req;
    const now = new Date();
    const hour = now.getHours();
    let timeList = [];
    let timeLimit = 0;
    const setLimitAndPushReturn = (musicFound) => {
        if (curTimeList.length < musicFound.length) {
            if (musicFound.length - curTimeList.length < 7) {
                timeLimit = musicFound.length - curTimeList.length;
            } else {
                timeLimit = 7;
            }
        } else {
            return res.sendStatus(304);
        }
        while (timeList.length < timeLimit) {
            const randomIndex = Math.floor(Math.random() * musicFound.length);
            if (
                timeList.includes(musicFound[randomIndex]) ||
                curTimeList.includes(musicFound[randomIndex]._id.toString())
            ) {
                continue;
            }
            timeList.push(musicFound[randomIndex]);
        }
    };

    if (1 <= hour && hour < 6) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: ["발라드", "포크/어쿠스틱", "알앤비/소울", "재즈"],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
    } else if (6 <= hour && hour < 10) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "댄스/팝",
                    "랩/힙합",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
    } else if (10 <= hour && hour < 16) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "포크/어쿠스틱",
                    "알앤비/소울",
                    "재즈",
                    "인디",
                    "J-POP",
                    "클래식",
                    "뉴에이지",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
    } else if (16 <= hour && hour < 21) {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "랩/힙합",
                    "알앤비/소울",
                    "일렉트로닉",
                    "락/메탈",
                    "재즈",
                    "인디",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
    } else {
        const allTimeMusic = await Music.find({
            genre: {
                $in: [
                    "발라드",
                    "댄스/팝",
                    "포크/어쿠스틱",
                    "랩/힙합",
                    "알앤비/소울",
                    "일렉트로닉",
                    "락/메탈",
                    "인디",
                    "재즈",
                    "J-POP",
                ],
            },
        });
        setLimitAndPushReturn(allTimeMusic);
    }
    const timeIsAll = timeLimit < 7 ? true : false;
    return res.status(200).json({ timeList: timeList, timeIsAll: timeIsAll });
};
