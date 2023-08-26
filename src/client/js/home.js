const randomMoreBtn = document.getElementById("randomMoreButton");
const randomGrid = document.getElementById("randomGrid");
const listenedMoreBtn = document.getElementById("listenedMoreBtn");
const listenedGrid = document.getElementById("listenedGrid");
let allMusics = document.querySelectorAll(".music-mixin");
let randomMusics = document.querySelectorAll(".randomMixin");
let listenedMusics = document.querySelectorAll(".listenedMixin");

const addOverflowTextAnimation = (outer, inner) => {
    if (outer.clientWidth < inner.clientWidth) {
        inner.classList.add("textOverflow");
    } else {
        inner.classList.remove("textOverflow");
    }
};
const reAddAnimation = (all) => {
    all.forEach((v) => {
        const dataBox = v.querySelector(".music-mixin__data");
        const title = dataBox.querySelector(".music-mixin__title");
        const artist = dataBox.querySelector(".music-mixin__artist");
        addOverflowTextAnimation(dataBox, title);
        addOverflowTextAnimation(dataBox, artist);
    });
};
reAddAnimation(allMusics);

const printRandomMusicList = (arr) => {
    arr.forEach((v) => {
        const template = `
        <a class="music-mixin randomMixin" href="/music/${v._id}" data-musicid=${v._id}>
            <div class="music-img-cutter">
                <img src=${v.musicInfo.musicThumbnailSrc} alt="">
            </div>
            <div class="music-mixin__data">
                <span class="music-mixin__title">${v.title}</span>
                <span class="music-mixin__artist">${v.artist}</span>
            </div>
        </a>
        `;
        randomGrid.innerHTML += template;
    });
};

randomMoreBtn.addEventListener("click", async () => {
    const list = [];
    randomMusics = document.querySelectorAll(".randomMixin");
    randomMusics.forEach((v) => {
        const id = v.dataset.musicid;
        list.push(id);
    });
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
            randomMoreBtn.classList.add("cantmore");
        }
        printRandomMusicList(randomMusicList);
        allMusics = document.querySelectorAll(".music-mixin");
        reAddAnimation(allMusics);
    }
});

const printListenedMusicList = (arr) => {
    arr.forEach((v) => {
        const template = `
        <a class="music-mixin listenedMixin" href="/music/${v._id}" data-musicid=${v._id}>
            <div class="music-img-cutter">
                <img src=${v.musicInfo.musicThumbnailSrc} alt="">
            </div>
            <div class="music-mixin__data">
                <span class="music-mixin__title">${v.title}</span>
                <span class="music-mixin__artist">${v.artist}</span>
            </div>
        </a>
        `;
        listenedGrid.innerHTML += template;
    });
};

listenedMoreBtn.addEventListener("click", async () => {
    const list = [];
    listenedMusics = document.querySelectorAll(".listenedMixin");
    listenedMusics.forEach((v) => {
        const id = v.dataset.musicid;
        list.push(id);
    });
    const response = await fetch("/api/musics/get-more-listenedmusic", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: list }),
    });
    if (response.status === 200) {
        const { listenedList, isAll } = await response.json();
        console.log(listenedList, isAll);
        if (isAll) {
            listenedMoreBtn.classList.add("cantmore");
        }
        printListenedMusicList(listenedList);
        listenedMusics = document.querySelectorAll(".listenedMixin");
        reAddAnimation(listenedMusics);
    }
});
