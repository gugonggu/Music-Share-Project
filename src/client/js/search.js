const select = document.getElementById("select");
const searchInput = document.getElementById("searchInput");

select.addEventListener("change", () => {
    const selectValue = select.options[select.selectedIndex].value;
    if (selectValue === "title") {
        searchInput.placeholder = "제목으로 검색";
        searchInput.name = "titleKeyword";
    } else if (selectValue === "artist") {
        searchInput.placeholder = "아티스트로 검색";
        searchInput.name = "artistKeyword";
    } else {
        searchInput.placeholder = "장르로 검색";
        searchInput.name = "genreKeyword";
    }
});
