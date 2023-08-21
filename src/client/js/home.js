const randomMoreBtn = document.getElementById("randomMoreButton");
const randomGrid = document.getElementById("randomGrid");
const randomMusics = document.querySelectorAll(".randomMixin");

const addOverflowTextAnimation = (outer, inner) => {
    if (outer.clientWidth < inner.clientWidth) {
        inner.classList.add("textOverflow");
    } else {
        inner.classList.remove("textOverflow");
    }
};

randomMusics.forEach((v) => {
    const dataBox = v.querySelector(".music-mixin__data");
    const title = dataBox.querySelector(".music-mixin__title");
    const artist = dataBox.querySelector(".music-mixin__artist");
    addOverflowTextAnimation(dataBox, title);
    addOverflowTextAnimation(dataBox, artist);
});

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
    randomMusics.forEach((v) => {
        const id = v.dataset.musicid;
        list.push(id);
    });
    const response = await fetch("/api/get-more-randommusic", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: list }),
    });
    if (response.status === 200) {
        const { randomMusicList } = await response.json();
        printRandomMusicList(randomMusicList);
    }
});
