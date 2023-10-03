import "../scss/styles.scss";

const openButton = document.querySelector(".openNavBtn");
const closeButton = document.querySelector(".closeNavBtn");
const navBar = document.querySelector("nav");
const blur = document.querySelector(".blurDiv");
const playlistContainer = document.querySelector(".playlistContainer");

openButton.addEventListener("click", function () {
    navBar.classList.add("navWidth");
    navBar.classList.remove("none");
    blur.classList.add("blurDivStyle");
});

closeButton.addEventListener("click", function () {
    navBar.classList.remove("navWidth");
    navBar.classList.add("none");
    blur.classList.remove("blurDivStyle");
});

blur.addEventListener("click", () => {
    navBar.classList.remove("navWidth");
    navBar.classList.add("none");
    blur.classList.remove("blurDivStyle");
});

(async () => {
    const response = await fetch("/api/playlist/getUserPlaylist", {
        method: "GET",
    });
    if (response.status === 200) {
        const { userPlaylist } = await response.json();
        if (0 < userPlaylist.length) {
            userPlaylist.forEach((v) => {
                const template = `
                <a href="/playlist/${v._id}">
                    <i class="fa-solid fa-compact-disc fa-xl"></i>
                    <span>${v.title}</span>
                </a>`;
                playlistContainer.innerHTML += template;
            });
        }
        playlistContainer.innerHTML += `
            <a href="/playlist/create">
                <i class="fa-solid fa-plus fa-xl"></i>
                <span>플레이리스트 생성</span>
            </a>
            `;
    }
})();
