const genreInput = document.getElementById("genreInput");
const genreSelect = document.getElementById("genreSelect");

genreInput.addEventListener("focus", () => {
    genreSelect.classList.remove("selectNone");
});

const values = document.querySelectorAll(".genre");
values.forEach((v) => {
    v.addEventListener("click", () => {
        genreInput.value = v.innerText;
        genreSelect.classList.add("selectNone");
    });
});
