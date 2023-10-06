const deleteButtons = document.querySelectorAll(".playlistMusicDeleteWrap");
const playlistId = document.getElementById("playlistId").dataset.playlistid;
const playlistAddMusicBtn = document.querySelector(".playlistAddMusic");

deleteButtons.forEach((v) => {
    v.addEventListener("click", async (e) => {
        const response = await fetch(
            `/api/playlist/${playlistId}/delete/${v.dataset.musicid}`,
            {
                method: "DELETE",
            }
        );
        if (response.status === 200) {
            location.reload();
        }
    });
});

playlistAddMusicBtn.addEventListener("click", async () => {
    console.log("리스트 어떻게 남길지 고민");
    // dataset에 += 로 " id" 이렇게 남겨서 .split(" ")하기?
    // 일단 클릭하면 음악 추가하기 버튼 none 시키고 추가 음악 리스트랑 다른 음악보기 버튼 나오면 좋을 듯
});
