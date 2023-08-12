const backBtn = document.getElementById("backBtn");
const moreBtn = document.getElementById("moreBtn");
const listenBlur = document.querySelector(".listenBlurDiv");
const moreWrap = document.getElementById("moreWrap");
const dislikeBtn = document.getElementById("dislikeBtn");
const likeBtn = document.getElementById("likeBtn");
const soundBtn = document.querySelector(".music__control-sound");
const soundInput = document.querySelector(".music__control-sound-background");

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

soundBtn.addEventListener("click", () => {
    soundInput.classList.toggle("inputNone");
});

dislikeBtn.addEventListener("click", () => {
    dislikeBtn.classList.toggle("fa-regular");
    dislikeBtn.classList.toggle("fa-solid");
    if (likeBtn.classList.contains("fa-solid")) {
        likeBtn.classList.toggle("fa-regular");
        likeBtn.classList.toggle("fa-solid");
    }
});

likeBtn.addEventListener("click", () => {
    likeBtn.classList.toggle("fa-regular");
    likeBtn.classList.toggle("fa-solid");
    if (dislikeBtn.classList.contains("fa-solid")) {
        dislikeBtn.classList.toggle("fa-regular");
        dislikeBtn.classList.toggle("fa-solid");
    }
});
