const controlTopMid = document.querySelector(".music__control-top-mid");
const editBtn = document.getElementById("editButton");
const deleteBtn = document.getElementById("deleteButton");
const loggedInUserId = controlTopMid.dataset.loggedinuser;
const backBtn = document.getElementById("backBtn");
const moreBtn = document.getElementById("moreBtn");
const listenBlur = document.querySelector(".listenBlurDiv");
const moreWrap = document.getElementById("moreWrap");
const iframe = document.querySelector("iframe");
const curMusicBox = document.querySelector(".music__data");
const curMusicTitle = document.querySelector(".music__title");
const curMusicArtist = document.querySelector(".music__artist");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeBtn = document.getElementById("likeBtn");
const timeInput = document.getElementById("timeInput");
const timeLeft = document.querySelector(".music__time-left");
const timeTotal = document.querySelector(".music__time-total");
const shuffleBtn = document.getElementById("shuffleBtn");
const playBtn = document.getElementById("playBtn");
const loopBtn = document.getElementById("loopBtn");
const loopIcon = loopBtn.querySelector("i");
const loopOne = loopBtn.querySelector("span");
const prevBtn = document.getElementById("prevBtn");
const playIcon = playBtn.querySelector("i");
const nextBtn = document.getElementById("nextBtn");
const soundBtn = document.querySelector(".music__control-sound");
const soundBack = document.querySelector(".music__control-sound-background");
const soundInput = soundBack.querySelector("input");
const soundIcon = document.getElementById("soundIcon");
const musicRandom = document.getElementById("musicRandom");
const musicSameGenre = document.getElementById("musicSameGenre");
const musicList = document.getElementById("musicList");
const verticalMore = document.getElementById("verticalMore");
const moreImg = document.getElementById("moreImg");
const moreMusicTitle = document.querySelector(".more__music-title");
const moreMusicArtist = document.querySelector(".more__music-artist");
const moreDislikeBtn = document.getElementById("moreDislikeBtn");
const moreLikeBtn = document.getElementById("moreLikeBtn");
const moreAnchor = document.getElementById("moreAnchor");

window.addEventListener("popstate", () => {
    location.href = "/";
});

const addOverflowTextAnimation = (outer, inner) => {
    if (outer.clientWidth < inner.clientWidth) {
        inner.classList.add("textOverflow");
    } else {
        inner.classList.remove("textOverflow");
    }
};

addOverflowTextAnimation(curMusicBox, curMusicTitle);
addOverflowTextAnimation(curMusicBox, curMusicArtist);

let musics = document.querySelectorAll(".music__vertical");
musics[0].classList.add("nowPlaying");

const loggedInPage = (obj) => {
    controlTopMid.innerHTML = `<a id="editButton" class="music__verifiedButton" href="${obj.dataset.musicid}/edit">
        <i class="fa-solid fa-pen-to-square"></i>
        <span>Edit Music</span>
    </a>
    <a id="deleteButton" class="music__verifiedButton" href="${obj.dataset.musicid}/delete">
        <i class="fa-solid fa-trash"></i>
        <span>Delete Music</span>
    </a>
    `;
};

const notLoggedInPage = (id, username) => {
    controlTopMid.innerHTML = `
    <div class="music__control-top-recommender">
        <a class="music__recommender" href="/users/${id}">${username}</a>
        <span>님이 추천함</span>
    </div>
    `;
};

let curMusic = 0;
const changeCurMusicInfo = async (v) => {
    musics.forEach((e) => {
        e.classList.remove("nowPlaying");
    });
    v.classList.add("nowPlaying");
    player.loadVideoByUrl({
        mediaContentUrl: v.dataset.verticalmusicsrc,
    });
    iframe.dataset.currentmusicid = v.dataset.musicid;
    const imgSrc = v
        .querySelector(".music__vertical-img-wrap")
        .querySelector("img").src;
    const title = v.querySelector("p").innerText;
    const artist = v.querySelector(".music__vertical-mixin-artist").innerText;
    const recommender = v.querySelector(".music__vertical-mixin-artist-wrap")
        .dataset.recommender;
    const recommenderId = v.querySelector(".music__vertical-mixin-artist-wrap")
        .dataset.recommenderid;
    document.title = `${title} | Chillin on the beat`;
    curMusicTitle.innerText = title;
    curMusicArtist.innerText = artist;
    addOverflowTextAnimation(curMusicBox, curMusicTitle);
    addOverflowTextAnimation(curMusicBox, curMusicArtist);
    moreImg.src = imgSrc;
    moreMusicTitle.innerText = title;
    moreMusicArtist.innerText = artist;
    moreAnchor.href = `/search?artistKeyword=${artist}`;
    if (loggedInUserId === recommenderId) {
        loggedInPage(v);
    } else {
        notLoggedInPage(recommenderId, recommender);
    }
    const response = await fetch(
        `/api/musics/${v.dataset.musicid}/confirmLiked`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ loggedInUserId: loggedInUserId }),
        }
    );
    if (response.status === 200) {
        const { liked } = await response.json();
        if (liked) {
            if (!likeBtn.classList.contains("fa-solid")) {
                likeBtn.classList.remove("fa-regular");
                likeBtn.classList.add("fa-solid");
            }
            if (dislikeBtn.classList.contains("fa-solid")) {
                dislikeBtn.classList.remove("fa-solid");
                dislikeBtn.classList.add("fa-regular");
            }
        } else if (liked === false) {
            if (!dislikeBtn.classList.contains("fa-solid")) {
                dislikeBtn.classList.remove("fa-regular");
                dislikeBtn.classList.add("fa-solid");
            }
            if (likeBtn.classList.contains("fa-solid")) {
                likeBtn.classList.remove("fa-solid");
                likeBtn.classList.add("fa-regular");
            }
        } else {
            if (likeBtn.classList.contains("fa-solid")) {
                likeBtn.classList.remove("fa-solid");
                likeBtn.classList.add("fa-regular");
            }
            if (dislikeBtn.classList.contains("fa-solid")) {
                dislikeBtn.classList.remove("fa-solid");
                dislikeBtn.classList.add("fa-regular");
            }
        }
    }
    const urlParams = new URL(window.location.href).searchParams;
    if (urlParams.has("re")) {
        history.pushState(
            null,
            "",
            `${v.dataset.musicid}?re=${urlParams.get("re")}`
        );
    } else if (urlParams.has("weather")) {
        history.pushState(
            null,
            "",
            `${v.dataset.musicid}?weather=${urlParams.get("weather")}`
        );
    } else if (urlParams.has("time")) {
        history.pushState(
            null,
            "",
            `${v.dataset.musicid}?time=${urlParams.get("time")}`
        );
    } else if (urlParams.has("playlist")) {
        history.pushState(
            null,
            "",
            `${v.dataset.musicid}?playlist=${urlParams.get("playlist")}`
        );
    } else {
        history.pushState(null, "", v.dataset.musicid);
    }
};

let list = [];
let randomList = [];

musics.forEach((v) => {
    const randomId = v.dataset.musicid;
    const randomMusicSrc = v.dataset.verticalmusicsrc;
    const randomImgSrc = v
        .querySelector(".music__vertical-img-wrap")
        .querySelector("img").src;
    const randomTitle = v.querySelector("p").innerText;
    const randomArtist = v.querySelector(
        ".music__vertical-mixin-artist"
    ).innerText;
    const randomRecommender = v.querySelector(
        ".music__vertical-mixin-artist-wrap"
    ).dataset.recommender;
    const randomRecommenderId = v.querySelector(
        ".music__vertical-mixin-artist-wrap"
    ).dataset.recommenderid;
    const randomObj = {
        _id: randomId,
        title: randomTitle,
        artist: randomArtist,
        musicInfo: {
            musicSrc: randomMusicSrc,
            musicThumbnailSrc: randomImgSrc,
        },
        recommender: {
            _id: randomRecommenderId,
            username: randomRecommender,
        },
    };
    randomList.push(randomObj);

    list.push(v);
    addOverflowTextAnimation(curMusicBox, curMusicTitle);
    v.addEventListener("click", () => {
        changeCurMusicInfo(v);
        const musicsList = Array.prototype.slice.call(musics);
        curMusic = musicsList.indexOf(v);
    });
});
const formatTime = (sec) => {
    const startIdx = sec >= 3600 ? 11 : 14;
    return new Date(sec * 1000).toISOString().substring(startIdx, 19);
};

let player;
window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("player", {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
};

function onPlayerReady() {
    (async () => {
        const response = await fetch(`/api/users/${loggedInUserId}/sound`, {
            method: "GET",
        });
        if (response.status === 200) {
            const { value } = await response.json();
            soundInput.value = value;
            player.setVolume(value);
            if (value == 0) {
                soundIcon.classList.remove("fa-volume-off");
                soundIcon.classList.add("fa-volume-xmark");
            } else if (value > 0 && value <= 30) {
                soundIcon.classList.remove("fa-volume-xmark");
                soundIcon.classList.remove("fa-volume-low");
                soundIcon.classList.add("fa-volume-off");
            } else if (value > 30 && value <= 60) {
                soundIcon.classList.remove("fa-volume-off");
                soundIcon.classList.remove("fa-volume-high");
                soundIcon.classList.add("fa-volume-low");
            } else {
                soundIcon.classList.remove("fa-volume-off");
                soundIcon.classList.remove("fa-volume-low");
                soundIcon.classList.add("fa-volume-high");
            }
        }
    })();
}

function onPlayerStateChange(e) {
    if (e.data == 1) {
        playIcon.classList.remove("fa-play");
        playIcon.classList.add("fa-pause");
        timeInput.max = Math.floor(player.getDuration());
        timeTotal.innerText = formatTime(Math.floor(player.getDuration()));
        setInterval(() => {
            timeInput.value = Math.floor(player.getCurrentTime());
            timeLeft.innerText = formatTime(
                Math.floor(player.getCurrentTime())
            );
        }, 1000);
    } else if (e.data == 0) {
        (async () => {
            await fetch(
                `/api/musics/${iframe.dataset.currentmusicid}/listened`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ loggedInUserId: loggedInUserId }),
                }
            );
        })();
        if (loopCount === 1) {
            if (curMusic === list.length - 1) {
                (async () => {
                    const list = [];
                    musics.forEach((v) => {
                        list.push(v.dataset.musicid);
                    });
                    if (musicRandom.classList.contains("listSelected")) {
                        const response = await fetch(
                            "/api/musics/get-more-randommusic",
                            {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ list: list }),
                            }
                        );
                        if (response.status === 200) {
                            const { randomMusicList, isAll } =
                                await response.json();
                            if (isAll) {
                                randomAll = isAll;
                                verticalMore.classList.add("cantmore");
                            }
                            printVerticalMusic(randomMusicList);
                        }
                        randomList = [];
                        musics.forEach((v) => {
                            const randomId = v.dataset.musicid;
                            const randomMusicSrc = v.dataset.verticalmusicsrc;
                            const randomImgSrc = v
                                .querySelector(".music__vertical-img-wrap")
                                .querySelector("img").src;
                            const randomTitle = v.querySelector("p").innerText;
                            const randomArtist = v.querySelector(
                                ".music__vertical-mixin-artist"
                            ).innerText;
                            const randomRecommender = v.querySelector(
                                ".music__vertical-mixin-artist-wrap"
                            ).dataset.recommender;
                            const randomRecommenderId = v.querySelector(
                                ".music__vertical-mixin-artist-wrap"
                            ).dataset.recommenderid;
                            const randomObj = {
                                _id: randomId,
                                title: randomTitle,
                                artist: randomArtist,
                                musicInfo: {
                                    musicSrc: randomMusicSrc,
                                    musicThumbnailSrc: randomImgSrc,
                                },
                                recommender: {
                                    _id: randomRecommenderId,
                                    username: randomRecommender,
                                },
                            };
                            randomList.push(randomObj);
                        });
                    } else {
                        const musicId = iframe.dataset.currentmusicid;
                        const response = await fetch(
                            `/api/musics/${musicId}/get-more-samegenremusic`,
                            {
                                method: "PATCH",
                                headers: {
                                    "Content-Type": "application/json",
                                },
                                body: JSON.stringify({ list: list }),
                            }
                        );
                        if (response.status === 200) {
                            const { sameGenreList, isAll } =
                                await response.json();
                            if (isAll) {
                                verticalMore.classList.add("cantmore");
                            }
                            printVerticalMusic(sameGenreList);
                        }
                    }
                })().then(() => {
                    curMusic++;
                    changeCurMusicInfo(list[curMusic]);
                });
            } else {
                curMusic++;
                changeCurMusicInfo(list[curMusic]);
            }
        } else if (loopCount === 2) {
            if (curMusic === list.length - 1) {
                curMusic = 0;
                changeCurMusicInfo(list[curMusic]);
            } else {
                curMusic++;
                changeCurMusicInfo(list[curMusic]);
            }
        } else {
            player.seekTo(0);
        }
    } else {
        playIcon.classList.remove("fa-pause");
        playIcon.classList.add("fa-play");
    }
}

backBtn.addEventListener("click", async () => {
    history.back();
});

moreBtn.addEventListener("click", () => {
    listenBlur.classList.add("blurDivStyle");
    moreWrap.classList.remove("more-wrap-none");
});

listenBlur.addEventListener("click", () => {
    listenBlur.classList.remove("blurDivStyle");
    moreWrap.classList.add("more-wrap-none");
});

const changeDislikeBtn = () => {
    dislikeBtn.classList.toggle("fa-regular");
    dislikeBtn.classList.toggle("fa-solid");
    moreDislikeBtn.classList.toggle("fa-regular");
    moreDislikeBtn.classList.toggle("fa-solid");
};

const changeLikeBtn = () => {
    likeBtn.classList.toggle("fa-regular");
    likeBtn.classList.toggle("fa-solid");
    moreLikeBtn.classList.toggle("fa-regular");
    moreLikeBtn.classList.toggle("fa-solid");
};

dislikeBtn.addEventListener("click", async () => {
    changeDislikeBtn();
    if (
        likeBtn.classList.contains("fa-solid") ||
        moreLikeBtn.classList.contains("fa-solid")
    ) {
        changeLikeBtn();
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/dislike`, {
        method: "POST",
    });
});

likeBtn.addEventListener("click", async () => {
    changeLikeBtn();
    if (
        dislikeBtn.classList.contains("fa-solid") ||
        moreDislikeBtn.classList.contains("fa-solid")
    ) {
        changeDislikeBtn();
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/like`, {
        method: "POST",
    });
});

moreDislikeBtn.addEventListener("click", async () => {
    changeDislikeBtn();
    if (
        likeBtn.classList.contains("fa-solid") ||
        moreLikeBtn.classList.contains("fa-solid")
    ) {
        changeLikeBtn();
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/dislike`, {
        method: "POST",
    });
});

moreLikeBtn.addEventListener("click", async () => {
    changeLikeBtn();
    if (
        dislikeBtn.classList.contains("fa-solid") ||
        moreDislikeBtn.classList.contains("fa-solid")
    ) {
        changeDislikeBtn();
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/like`, {
        method: "POST",
    });
});

timeInput.addEventListener("input", () => {
    player.seekTo(Number(timeInput.value));
});

let loopCount = 1;
loopBtn.addEventListener("click", () => {
    if (loopCount === 1) {
        // 반복 없음 -> 전체 반복
        loopIcon.style.color = "white";
        loopCount++;
    } else if (loopCount === 2) {
        // 전체 반복 -> 한곡 반복
        loopOne.classList.remove("none");
        loopCount++;
    } else {
        // 한곡 반복 -> 반복 없음
        loopIcon.style.color = "gray";
        loopOne.classList.add("none");
        loopCount = 1;
    }
});

playBtn.addEventListener("click", () => {
    const state = player.getPlayerState();
    if (state === -1 || state === 0 || state === 2) {
        player.playVideo();
    } else {
        player.pauseVideo();
    }
});

prevBtn.addEventListener("click", () => {
    if (curMusic === 0) {
        return;
    }
    curMusic--;
    changeCurMusicInfo(list[curMusic]);
});

nextBtn.addEventListener("click", () => {
    if (curMusic === list.length - 1) {
        return;
    }
    curMusic++;
    changeCurMusicInfo(list[curMusic]);
});

soundBtn.addEventListener("click", () => {
    soundBack.classList.toggle("inputNone");
});

soundInput.addEventListener("input", () => {
    let value = soundInput.value;
    player.setVolume(value);
    if (value == 0) {
        soundIcon.classList.remove("fa-volume-off");
        soundIcon.classList.add("fa-volume-xmark");
    } else if (value > 0 && value <= 30) {
        soundIcon.classList.remove("fa-volume-xmark");
        soundIcon.classList.remove("fa-volume-low");
        soundIcon.classList.add("fa-volume-off");
    } else if (value > 30 && value <= 60) {
        soundIcon.classList.remove("fa-volume-off");
        soundIcon.classList.remove("fa-volume-high");
        soundIcon.classList.add("fa-volume-low");
    } else {
        soundIcon.classList.remove("fa-volume-low");
        soundIcon.classList.add("fa-volume-high");
    }
});

soundInput.addEventListener("change", async () => {
    const value = soundInput.value;
    await fetch(`/api/users/${loggedInUserId}/sound`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ value: value }),
    });
});

const printMusicList = (arr) => {
    musicList.innerHTML = "";
    arr.forEach((v) => {
        let template = `
        <div class="music__vertical" data-musicid=${v._id} data-verticalmusicsrc=${v.musicInfo.musicSrc}>
            <div class="music__vertical-img-wrap">
                <img src=${v.musicInfo.musicThumbnailSrc} alt=""></img>
            </div>
            <div class="music__vertical-mixin-data">
                <p class="music__vertical-mixin-title">${v.title}</p>
                <div class="music__vertical-mixin-artist-wrap" data-recommenderid=${v.recommender._id} data-recommender=${v.recommender.username}>
                    <span class="music__vertical-mixin-artist">${v.artist}</span>
                </div>
            </div>
        </div>
        `;
        musicList.innerHTML += template;
    });
    musics = document.querySelectorAll(".music__vertical");
    if (isGenreList) {
        musics[randomIndex].classList.add("nowPlaying");
    } else {
        musics[0].classList.add("nowPlaying");
    }

    list = [];
    musics.forEach((v) => {
        list.push(v);
        v.addEventListener("click", () => {
            changeCurMusicInfo(v);
            const musicsList = Array.prototype.slice.call(musics);
            curMusic = musicsList.indexOf(v);
        });
    });
};

let randomIndex = 0;
let isGenreList = true;
let beforeList = [];

musicRandom.addEventListener("click", async () => {
    if (musicRandom.classList.contains("listSelected")) {
        return;
    } else {
        isGenreList = true;
        curMusic = randomIndex;
        musicRandom.classList.add("listSelected");
        musicSameGenre.classList.remove("listSelected");
        printMusicList(randomList);
        changeCurMusicInfo(beforeList[curMusic]);
        musics[curMusic].classList.add("nowPlaying");
        beforeList = [];
        if (randomList.length < 8 || randomAll) {
            verticalMore.classList.add("cantmore");
        } else {
            verticalMore.classList.remove("cantmore");
        }
    }
});

musicSameGenre.addEventListener("click", async () => {
    if (musicSameGenre.classList.contains("listSelected")) {
        return;
    } else {
        const prevRandomList = document.querySelectorAll(".music__vertical");
        prevRandomList.forEach((v) => {
            beforeList.push(v);
        });
        isGenreList = false;
        randomIndex = curMusic;
        curMusic = 0;
        musicSameGenre.classList.add("listSelected");
        musicRandom.classList.remove("listSelected");
        const musicId = iframe.dataset.currentmusicid;
        const response = await fetch(`/api/musics/${musicId}/sameGenre`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ list: list }),
        });
        if (response.status === 200) {
            const { sameGenreList } = await response.json();
            printMusicList(sameGenreList);
            verticalMore.classList.remove("cantmore");
        }
        if (list.length < 8) {
            verticalMore.classList.add("cantmore");
        }
    }
});

shuffleBtn.addEventListener("click", async () => {
    musics = document.querySelectorAll(".music__vertical");
    let willPrintedMusics = musics[curMusic];
    musics = [...musics]
        .filter((v) => v !== musics[curMusic])
        .sort(() => Math.random() - 0.5);
    willPrintedMusics = [willPrintedMusics, ...musics];
    musicList.innerHTML = "";
    willPrintedMusics.forEach((v) => {
        const template = `
        <div class="music__vertical" data-musicid=${v.dataset.musicid} data-verticalmusicsrc=${v.dataset.verticalmusicsrc}>
            <div class="music__vertical-img-wrap">
                <img src=${v.children[0].children[0].currentSrc} alt=""></img>
            </div>
            <div class="music__vertical-mixin-data">
                <p class="music__vertical-mixin-title">${v.children[1].children[0].innerText}</p>
                <div class="music__vertical-mixin-artist-wrap" data-recommenderid=${v.children[1].children[1].dataset.recommenderid} data-recommender=${v.children[1].children[1].dataset.recommender}>
                    <span class="music__vertical-mixin-artist">${v.children[1].children[1].children[0].innerText}</span>
                </div>
            </div>
        </div>
        `;
        musicList.innerHTML += template;
    });
    curMusic = 0;
    musics = document.querySelectorAll(".music__vertical");
    musics[curMusic].classList.add("nowPlaying");
    list = [];
    musics.forEach((v) => {
        list.push(v);
        v.addEventListener("click", () => {
            changeCurMusicInfo(v);
            const musicsList = Array.prototype.slice.call(musics);
            curMusic = musicsList.indexOf(v);
        });
    });
});

const printVerticalMusic = (arr) => {
    arr.forEach((v) => {
        const template = `
        <div class="music__vertical" data-musicid=${v._id} data-verticalmusicsrc=${v.musicInfo.musicSrc}>
            <div class="music__vertical-img-wrap">
                <img src=${v.musicInfo.musicThumbnailSrc} alt=""></img>
            </div>
            <div class="music__vertical-mixin-data">
                <p class="music__vertical-mixin-title">${v.title}</p>
                <div class="music__vertical-mixin-artist-wrap" data-recommenderid=${v.recommender._id} data-recommender=${v.recommender.username}>
                    <span class="music__vertical-mixin-artist">${v.artist}</span>
                </div>
            </div>
        </div>
        `;
        musicList.innerHTML += template;
    });
    musics = document.querySelectorAll(".music__vertical");
    musics[0].classList.add("nowPlaying");
    list = [];
    musics.forEach((v) => {
        list.push(v);
        v.addEventListener("click", () => {
            changeCurMusicInfo(v);
            const musicsList = Array.prototype.slice.call(musics);
            curMusic = musicsList.indexOf(v);
        });
    });
};

let randomAll = false;
verticalMore.addEventListener("click", async () => {
    const list = [];
    musics.forEach((v) => {
        list.push(v.dataset.musicid);
    });
    const params = new URLSearchParams(location.search);
    let param;
    for (let i of params) {
        param = i;
    }

    if (musicRandom.classList.contains("listSelected")) {
        const response = await fetch("/api/musics/get-more-randommusic", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                list: list,
                param,
                loggedInUserId: loggedInUserId,
            }),
        });
        if (response.status === 200) {
            const { randomMusicList, isAll } = await response.json();
            if (isAll) {
                randomAll = isAll;
                verticalMore.classList.add("cantmore");
            }
            printVerticalMusic(randomMusicList);
        }
        randomList = [];
        musics.forEach((v) => {
            const randomId = v.dataset.musicid;
            const randomMusicSrc = v.dataset.verticalmusicsrc;
            const randomImgSrc = v
                .querySelector(".music__vertical-img-wrap")
                .querySelector("img").src;
            const randomTitle = v.querySelector("p").innerText;
            const randomArtist = v.querySelector(
                ".music__vertical-mixin-artist"
            ).innerText;
            const randomRecommender = v.querySelector(
                ".music__vertical-mixin-artist-wrap"
            ).dataset.recommender;
            const randomRecommenderId = v.querySelector(
                ".music__vertical-mixin-artist-wrap"
            ).dataset.recommenderid;
            const randomObj = {
                _id: randomId,
                title: randomTitle,
                artist: randomArtist,
                musicInfo: {
                    musicSrc: randomMusicSrc,
                    musicThumbnailSrc: randomImgSrc,
                },
                recommender: {
                    _id: randomRecommenderId,
                    username: randomRecommender,
                },
            };
            randomList.push(randomObj);
        });
    } else {
        const musicId = iframe.dataset.currentmusicid;
        const response = await fetch(
            `/api/musics/${musicId}/get-more-samegenremusic`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ list: list }),
            }
        );
        if (response.status === 200) {
            const { sameGenreList, isAll } = await response.json();
            if (isAll) {
                verticalMore.classList.add("cantmore");
            }
            printVerticalMusic(sameGenreList);
        }
    }
});

const playlistButton = document.querySelector(".more__playlist-save");
const modal = document.querySelector(".addToPlaylistModalBackground");
const closeModal = document.getElementById("closeModal");
const playlists = document.querySelectorAll(".playlist");
const message = document.querySelector(".message");
const messageContent = document.querySelector(".messageContent");

playlists.forEach((v) => {
    v.addEventListener("click", async () => {
        const response = await fetch("/api/playlist/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                musicId: iframe.dataset.currentmusicid,
                playlistId: v.dataset.playlistid,
            }),
        });
        if (response.status === 200) {
            messageContent.innerText =
                "음악이 성공적으로 플레이리스트에 추가되었습니다.";
            message.classList.add("success");
            message.classList.remove("hide");
        } else if (response.status === 202) {
            messageContent.innerText =
                "이미 플레이리스트에 추가되어있는 음악입니다.";
            message.classList.add("error");
            message.classList.remove("hide");
        } else {
            messageContent.innerText =
                "플레이리스트에 음악을 추가하는 과정에서 오류가 발생했습니다.";
            message.classList.add("error");
            message.classList.remove("hide");
        }
    });
});

playlistButton.addEventListener("click", async () => {
    modal.classList.remove("hide");
});

closeModal.addEventListener("click", () => {
    modal.classList.add("hide");
});

modal.addEventListener("click", () => {
    modal.classList.add("hide");
});

const url = new URL(window.location.href);
const urlSplit = String(url).split("/");
const urlParams = url.searchParams;
if (urlParams.has("playlist")) {
    const currentMusicId = urlSplit[urlSplit.length - 1].split("?")[0];
    for (let i = 0; i < musics.length; i++) {
        if (currentMusicId === musics[i].dataset.musicid) {
            curMusic = i;
            break;
        }
    }
    musics.forEach((e) => {
        e.classList.remove("nowPlaying");
    });
    list[curMusic].classList.add("nowPlaying");
}
