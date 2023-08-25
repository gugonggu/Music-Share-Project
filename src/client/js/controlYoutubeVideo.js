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
    history.pushState(null, "", v.dataset.musicid);
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
        if (!isAllLoop) {
            player.seekTo(0);
            return;
        }
        if (curMusic === list.length - 1) {
            curMusic = 0;
            changeCurMusicInfo(list[curMusic]);
            return;
        }
        curMusic++;
        changeCurMusicInfo(list[curMusic]);
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

let isAllLoop = true;
loopBtn.addEventListener("click", () => {
    isAllLoop = isAllLoop ? false : true;
    loopOne.classList.toggle("none");
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

musicRandom.addEventListener("click", async () => {
    if (musicRandom.classList.contains("listSelected")) {
        return;
    } else {
        curMusic = 0;
        musicRandom.classList.add("listSelected");
        musicSameGenre.classList.remove("listSelected");
        printMusicList(randomList);
    }
});

musicSameGenre.addEventListener("click", async () => {
    if (musicSameGenre.classList.contains("listSelected")) {
        return;
    } else {
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
        }
    }
});

shuffleBtn.addEventListener("click", async () => {
    const list = [];
    musics.forEach((v) => {
        list.push(v.dataset.musicid);
    });
    curMusic = 0;
    const musicId = iframe.dataset.currentmusicid;
    if (musicRandom.classList.contains("listSelected")) {
        const response = await fetch(`/api/musics/${musicId}/random`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ list: list }),
        });
        if (response.status === 200) {
            const { randomMusicList } = await response.json();
            printMusicList(randomMusicList);
        }
    } else {
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
        }
    }
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

verticalMore.addEventListener("click", async () => {
    const list = [];
    musics.forEach((v) => {
        list.push(v.dataset.musicid);
    });
    if (musicRandom.classList.contains("listSelected")) {
        const response = await fetch("/api/musics/get-more-randommusic", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ list: list }),
        });
        if (response.status === 200) {
            const { randomMusicList, isAll } = await response.json();
            if (isAll) {
                // 더보기 스타일 변경
            }
            printVerticalMusic(randomMusicList);
        }
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
                // 더보기 스타일 변경
            }
            printVerticalMusic(sameGenreList);
        }
    }
});
