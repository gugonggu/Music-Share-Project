const deleteButtons = document.querySelectorAll(".playlistMusicDeleteWrap");
const playlistId = document.getElementById("playlistId").dataset.playlistid;

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
