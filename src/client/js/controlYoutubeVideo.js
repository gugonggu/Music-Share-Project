const controlTopMid = document.querySelector(".music__control-top-mid");
const loggedInUserId = controlTopMid.dataset.loggedinuser;
const backBtn = document.getElementById("backBtn");
const moreBtn = document.getElementById("moreBtn");
const listenBlur = document.querySelector(".listenBlurDiv");
const moreWrap = document.getElementById("moreWrap");
const iframe = document.querySelector("iframe");
const curMusicTitle = document.querySelector(".music__title");
const curMusicArtist = document.querySelector(".music__artist");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeBtn = document.getElementById("likeBtn");
const timeInput = document.getElementById("timeInput");
const timeLeft = document.querySelector(".music__time-left");
const timeTotal = document.querySelector(".music__time-total");
const shuffleBtn = document.getElementById("shuffleBtn");
const playBtn = document.getElementById("playBtn");
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
const moreImg = document.getElementById("moreImg");
const moreMusicTitle = document.querySelector(".more__music-title");
const moreMusicArtist = document.querySelector(".more__music-artist");
const moreDislikeBtn = document.getElementById("moreDislikeBtn");
const moreLikeBtn = document.getElementById("moreLikeBtn");
const moreAnchor = document.getElementById("moreAnchor");

const musics = document.querySelectorAll(".music__vertical");

const loggedInPage = (obj) => {
    controlTopMid.innerHTML = `<a class="music__verifiedButton" href="${obj.dataset.musicid}/edit">
        <i class="fa-solid fa-pen-to-square"></i>
        <span>Edit Music</span>
    </a>
    <a class="music__verifiedButton" href="${obj.dataset.musicid}/delete">
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

musics.forEach((v) =>
    v.addEventListener("click", () => {
        console.log("?");
        iframe.src = v.dataset.verticalmusicsrc;
        iframe.dataset.currentmusicid = v.dataset.musicid;
        const imgSrc = v
            .querySelector(".music__vertical-img-wrap")
            .querySelector("img").src;
        const title = v.querySelector("p").innerText;
        const artist = v.querySelector(
            ".music__vertical-mixin-artist"
        ).innerText;
        const recommender = v.querySelector(
            ".music__vertical-mixin-recommender"
        ).innerText;
        const recommenderId = v.querySelector(
            ".music__vertical-mixin-recommender"
        ).dataset.recommenderid;
        curMusicTitle.innerText = title;
        curMusicArtist.innerText = artist;
        moreImg.src = imgSrc;
        moreMusicTitle.innerText = title;
        moreMusicArtist.innerText = artist;
        moreAnchor.href = `/search?artistKeyword=${artist}`;
        if (loggedInUserId === recommenderId) {
            loggedInPage(v);
        } else {
            notLoggedInPage(recommenderId, recommender);
        }
        history.pushState(null, "", v.dataset.musicid);
    })
);

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

function onPlayerReady(e) {
    // iframe 기본 소리 크기 설정
    let value = soundInput.value;
    player.setVolume(value);
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
    } else {
        playIcon.classList.remove("fa-pause");
        playIcon.classList.add("fa-play");
    }
}

backBtn.addEventListener("click", () => {
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

shuffleBtn.addEventListener("click", async () => {
    const musicId = iframe.dataset.currentmusicid;
    if (musicRandom.classList.contains("listSelected")) {
        const response = await fetch(`/api/musics/${musicId}/random`, {
            method: "GET",
        });
        if (response.status === 200) {
            const { randomMusicList } = await response.json();
            printMusicList(randomMusicList);
        }
    } else {
        const response = await fetch(`/api/musics/${musicId}/sameGenre`, {
            method: "GET",
        });
        if (response.status === 200) {
            const { sameGenreList } = await response.json();
            printMusicList(sameGenreList);
        }
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
    console.log("hi");
});

nextBtn.addEventListener("click", () => {
    console.log(iframe.dataset.currentmusicid);
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

const printMusicList = (arr) => {
    musicList.innerHTML = "";
    arr.forEach((v, i) => {
        const newMusic = document.createElement("div");
        newMusic.className = "music__vertical";
        newMusic.dataset.musicid = v._id;
        newMusic.dataset.verticalmusicsrc = v.musicInfo.musicSrc;
        const musicImgWrap = document.createElement("div");
        musicImgWrap.className = "music__vertical-img-wrap";
        newMusic.appendChild(musicImgWrap);
        const musicImg = document.createElement("img");
        musicImgWrap.appendChild(musicImg);
        musicImg.src = v.musicInfo.musicThumbnailSrc;
        musicImg.alt = "";
        const musicData = document.createElement("div");
        musicData.className = "music__vertical-mixin-data";
        newMusic.appendChild(musicData);
        const musicTitle = document.createElement("p");
        musicTitle.className = "music__vertical-mixin-title";
        musicTitle.innerText = v.title;
        musicData.appendChild(musicTitle);
        const musicArtistAndRecommender = document.createElement("div");
        musicArtistAndRecommender.className =
            "music__vertical-mixin-artist-and-recommender";
        musicData.appendChild(musicArtistAndRecommender);
        const musicArtist = document.createElement("span");
        musicArtist.className = "music__vertical-mixin-artist";
        musicArtist.innerText = v.artist;
        musicArtistAndRecommender.appendChild(musicArtist);
        const musicRecommenderWrap = document.createElement("div");
        musicRecommenderWrap.className =
            "music__vertical-mixin-recommender-wrap";
        musicArtistAndRecommender.appendChild(musicRecommenderWrap);
        const musicRecommender = document.createElement("a");
        musicRecommender.href = `/users/${v.recommender._id}`;
        musicRecommender.className = "music__vertical-mixin-recommender";
        musicRecommender.innerText = `${v.recommender.username}`;
        musicRecommenderWrap.appendChild(musicRecommender);
        const recommededBy = document.createElement("span");
        recommededBy.innerText = "님이 추천함";
        musicRecommenderWrap.appendChild(recommededBy);
        musicList.appendChild(newMusic);
    });
};

musicRandom.addEventListener("click", async () => {
    if (musicRandom.classList.contains("listSelected")) {
        return;
    } else {
        musicRandom.classList.add("listSelected");
        musicSameGenre.classList.remove("listSelected");
        const musicId = iframe.dataset.currentmusicid;
        const response = await fetch(`/api/musics/${musicId}/random`, {
            method: "GET",
        });
        if (response.status === 200) {
            const { randomMusicList } = await response.json();
            printMusicList(randomMusicList);
        }
    }
});

musicSameGenre.addEventListener("click", async () => {
    if (musicSameGenre.classList.contains("listSelected")) {
        return;
    } else {
        musicSameGenre.classList.add("listSelected");
        musicRandom.classList.remove("listSelected");
        const musicId = iframe.dataset.currentmusicid;
        const response = await fetch(`/api/musics/${musicId}/sameGenre`, {
            method: "GET",
        });
        if (response.status === 200) {
            const { sameGenreList } = await response.json();
            printMusicList(sameGenreList);
        }
    }
});
