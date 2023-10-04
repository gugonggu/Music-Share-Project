const randomMoreBtn = document.getElementById("randomMoreButton");
const randomGrid = document.getElementById("randomGrid");
const listenedMoreBtn = document.getElementById("listenedMoreBtn");
const listenedGrid = document.getElementById("listenedGrid");
const playlistMoreBtn = document.getElementById("playlistMoreBtn");
const playlistGrid = document.getElementById("playlistGrid");
let allMusics = document.querySelectorAll(".music-mixin");
let randomMusics = document.querySelectorAll(".randomMixin");
let listenedMusics = document.querySelectorAll(".listenedMixin");
let weatherMusics = document.querySelectorAll(".weatherMixin");

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
        if (isAll) {
            listenedMoreBtn.classList.add("cantmore");
        }
        printListenedMusicList(listenedList);
        listenedMusics = document.querySelectorAll(".listenedMixin");
        reAddAnimation(listenedMusics);
    }
});

const printWeathermMusicList = (arr, weatherData) => {
    arr.forEach((v) => {
        const template = `
        <a class="music-mixin weatherMixin" href="/music/${v._id}?weather=${weatherData}" data-musicid=${v._id}>
            <div class="music-img-cutter">
                <img src=${v.musicInfo.musicThumbnailSrc} alt="">
            </div>
            <div class="music-mixin__data">
                <span class="music-mixin__title">${v.title}</span>
                <span class="music-mixin__artist">${v.artist}</span>
            </div>
        </a>
        `;
        weatherGrid.innerHTML += template;
    });
};
// 날씨 가져오기
const weatherSpan = document.querySelector(".weather");
const weatherIcon = document.querySelector(".weatherIcon");
const weatherTitle = document.getElementById("weatherTitle");
const weatherGrid = document.getElementById("weatherGrid");
const weatherMoreBtn = document.getElementById("weatherMoreBtn");
const API_KEY = "7ec06aa850b4dd036da0531079c5d23b";
let lat = "";
let lon = "";
let weatherApiUrl = "";
let weather = "";
const successGetLocation = (position) => {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(weatherApiUrl)
        .then((response) => response.json())
        .then(async (data) => {
            weather = data.weather[0].main;
            const list = [];
            weatherMusics = document.querySelectorAll(".weatherMixin");
            weatherMusics.forEach((v) => {
                const id = v.dataset.musicid;
                list.push(id);
            });
            const response = await fetch("/api/musics/recommend-by-weather", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ weather: weather, list: list }),
            });
            if (response.status === 200) {
                const { randomWeatherMusicList, isAll, weatherTitleValue } =
                    await response.json();
                if (isAll) {
                    weatherMoreBtn.classList.add("cantmore");
                }
                weatherTitle.innerText = weatherTitleValue;
                printWeathermMusicList(randomWeatherMusicList, weather);
                weatherMusics = document.querySelectorAll(".weatherMixin");
                reAddAnimation(weatherMusics);
            }
            weatherIcon.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        })
        .catch((error) => {
            alert(error);
        });
};
const failGetLocation = () => {
    weatherTitle.innerText = "날씨 정보를 가져올 수 없습니다.";
};
navigator.geolocation.getCurrentPosition(successGetLocation, failGetLocation);

weatherMoreBtn.addEventListener("click", async () => {
    const list = [];
    const allWeatherMusics = document.querySelectorAll(".weatherMixin");
    allWeatherMusics.forEach((v) => {
        list.push(v.dataset.musicid);
    });
    const response = await fetch("/api/musics/get-more-weather-musics", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ list: list, weather: weather }),
    });
    if (response.status === 200) {
        const { randomWeatherMusicList, isAll } = await response.json();
        if (isAll) {
            weatherMoreBtn.classList.add("cantmore");
        }
        printWeathermMusicList(randomWeatherMusicList, weather);
        weatherMusics = document.querySelectorAll(".weatherMixin");
        reAddAnimation(weatherMusics);
    }
});

// 시간
const timeMoreBtn = document.getElementById("timeMoreBtn");
const timeGrid = document.getElementById("timeGrid");

const printTimeMusicList = (arr, timeData) => {
    arr.forEach((v) => {
        const template = `
        <a class="music-mixin timeMixin" href="/music/${v._id}?time=${timeData}" data-musicid=${v._id}>
            <div class="music-img-cutter">
                <img src=${v.musicInfo.musicThumbnailSrc} alt="">
            </div>
            <div class="music-mixin__data">
                <span class="music-mixin__title">${v.title}</span>
                <span class="music-mixin__artist">${v.artist}</span>
            </div>
        </a>
        `;
        timeGrid.innerHTML += template;
    });
};

timeMoreBtn.addEventListener("click", async () => {
    const curTimeList = [];
    const allTimeMusic = document.querySelectorAll(".timeMixin");
    allTimeMusic.forEach((v) => {
        curTimeList.push(v.dataset.musicid);
    });
    const response = await fetch("/api/musics/get-more-time-musics", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ curTimeList: curTimeList }),
    });
    if (response.status === 200) {
        const { timeList, timeIsAll } = await response.json();
        if (timeIsAll) {
            timeMoreBtn.classList.add("cantmore");
        }
        const now = new Date();
        const hour = now.getHours();
        printTimeMusicList(timeList, hour);
        const timeMusics = document.querySelectorAll(".timeMixin");
        reAddAnimation(timeMusics);
    }
});

playlistMoreBtn.addEventListener("click", async () => {
    const curPlaylistList = [];
    const playlists = document.querySelectorAll(".playlistMixin");
    playlists.forEach((v) => curPlaylistList.push(v.dataset.playlistid));
    const response = fetch("/api/playlist/get-more-playlists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curPlaylistList }),
    });
    if (response.status === 200) {
        console.log("HELLO");
    }
});
