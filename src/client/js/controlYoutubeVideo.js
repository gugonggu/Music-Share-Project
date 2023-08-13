const backBtn = document.getElementById("backBtn");
const moreBtn = document.getElementById("moreBtn");
const listenBlur = document.querySelector(".listenBlurDiv");
const moreWrap = document.getElementById("moreWrap");
const iframe = document.querySelector("iframe");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeBtn = document.getElementById("likeBtn");
const timeInput = document.getElementById("timeInput");
const timeLeft = document.querySelector(".music__time-left");
const timeTotal = document.querySelector(".music__time-total");
const playBtn = document.getElementById("playBtn");
const playIcon = playBtn.querySelector("i");
const nextBtn = document.getElementById("nextBtn");
const soundBtn = document.querySelector(".music__control-sound");
const soundBack = document.querySelector(".music__control-sound-background");
const soundInput = soundBack.querySelector("input");
const soundIcon = document.getElementById("soundIcon");

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
    // iframe 기본 소리 크기 설정, 현재 작동 안함
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

timeInput.addEventListener("input", () => {
    player.seekTo(Number(timeInput.value));
});

playBtn.addEventListener("click", () => {
    const state = player.getPlayerState();
    if (state === -1 || state === 0 || state === 2) {
        player.playVideo();
    } else {
        player.pauseVideo();
    }
});

nextBtn.addEventListener("click", () => {
    console.log("asda");
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

dislikeBtn.addEventListener("click", async () => {
    dislikeBtn.classList.toggle("fa-regular");
    dislikeBtn.classList.toggle("fa-solid");
    if (likeBtn.classList.contains("fa-solid")) {
        likeBtn.classList.toggle("fa-regular");
        likeBtn.classList.toggle("fa-solid");
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/dislike`, {
        method: "POST",
    });
});

likeBtn.addEventListener("click", async () => {
    likeBtn.classList.toggle("fa-regular");
    likeBtn.classList.toggle("fa-solid");
    if (dislikeBtn.classList.contains("fa-solid")) {
        dislikeBtn.classList.toggle("fa-regular");
        dislikeBtn.classList.toggle("fa-solid");
    }
    const { currentmusicid } = iframe.dataset;
    await fetch(`/api/musics/${currentmusicid}/like`, {
        method: "POST",
    });
});
