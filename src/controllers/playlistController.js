import User from "../models/User";
import Music from "../models/Music";
import Playlist from "../models/Playlist";

export const getCreatePlaylist = (req, res) => {
    return res.render("createPlaylist", {
        pageTitle: "플레이리스트 생성",
    });
};

export const postCreatePlaylist = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { title },
    } = req;
    const user = await User.findById(_id);
    if (user.playlists.length > 9) {
        return res.status(400).render("createPlaylist", {
            pageTitle: "플레이리스트 생성",
            errorMessage: "플레이리스트는 10개 이상 생성할 수 없습니다.",
        });
    }
    try {
        const newPlaylist = await Playlist.create({
            title,
            meta: {
                creator: _id,
            },
        });
        user.playlists.push(newPlaylist._id);
        user.save();
        return res.redirect(`/playlist/${newPlaylist._id}`);
    } catch (error) {
        return res.status(400).render("createPlaylist", {
            pageTitle: "플레이리스트 생성",
            errorMessage: error._message,
        });
    }
};

export const getPlaylist = async (req, res) => {
    const {
        params: { id },
    } = req;
    const playlist = await Playlist.findById(id)
        .populate("meta.creator")
        .populate("list");
    let thumbnails = [];
    if (playlist.list.length > 3) {
        for (let i = 0; i < 4; i++) {
            thumbnails.push(playlist.list[i].musicInfo.musicThumbnailSrc);
        }
    } else if (playlist.list.length > 0 && playlist.list.length < 4) {
        thumbnails.push(playlist.list[0].musicInfo.musicThumbnailSrc);
    }
    return res.render("playlist", {
        pageTitle: playlist.title,
        playlist,
        thumbnails,
    });
};

export const getUserPlaylist = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
    } = req;
    const user = await User.findById(_id).populate("playlists");
    let userPlaylist = [];
    if (user) {
        userPlaylist = user.playlists;
    }
    return res.json({ userPlaylist: userPlaylist });
};

export const getDeletePlaylist = async (req, res) => {
    const {
        params: { id },
        session: {
            user: { _id },
        },
    } = req;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
        return res
            .status(404)
            .render("404", { pageTitle: "플레이리스트를 찾을 수 없습니다" });
    }
    if (String(playlist.meta.creator) !== String(_id)) {
        req.flash("error", "해당 플레이리스트를 만든 유저가 아닙니다.");
        return res.status(403).redirect("/");
    }
    const user = await User.findById(playlist.meta.creator);
    const filteredUserPlaylist = user.playlists.filter(
        (v) => String(v) !== String(id)
    );
    user.playlists = filteredUserPlaylist;
    await user.save();

    const allPlaylist = await Playlist.find();
    for (let i = 0; i < allPlaylist.length; i++) {
        const filteredUserPlaylist = allPlaylist[i].filter(
            (v) => String(v._id) !== String(id)
        );
        allPlaylist[i] = filteredUserPlaylist;
        await allPlaylist[i].save();
    }

    await Playlist.findByIdAndDelete(id);
    return res.redirect("/");
};

export const getPlaylistEdit = async (req, res) => {
    const {
        params: { id },
        session: {
            user: { _id },
        },
    } = req;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
        return res
            .status(400)
            .render("404", { pageTitle: "플레이리스트를 찾을 수 없습니다." });
    }
    if (String(playlist.meta.creator) !== String(_id)) {
        req.flash("error", "해당 플레이리스트를 만든 유저가 아닙니다.");
        return res.status(403).redirect("/");
    }
    return res.render("edit-playlist", {
        pageTitle: `${playlist.title} 수정`,
        playlist,
    });
};

export const postPlaylistEdit = async (req, res) => {
    const {
        params: { id },
        body: { title },
    } = req;
    const playlist = await Playlist.findById(id);
    if (!playlist) {
        return res
            .status(404)
            .render("404", { pageTitle: "플레이리스트를 찾을 수 없습니다." });
    }
    playlist.title = title;
    await playlist.save();
    req.flash("success", "변경사항이 저장되었습니다.");
    return res.redirect(`/playlist/${id}`);
};

export const addMusicToPlaylist = async (req, res) => {
    const {
        body: { musicId, playlistId },
    } = req;
    const playlist = await Playlist.findById(playlistId);
    let isDup = false;
    for (let i = 0; i < playlist.list.length; i++) {
        if (String(playlist.list[i]._id) === String(musicId)) {
            isDup = true;
            break;
        }
    }
    if (isDup === true) {
        return res.sendStatus(202);
    } else {
        playlist.list.unshift(musicId);
        await playlist.save();
        return res.sendStatus(200);
    }
};

export const deleteMusicFromPlaylist = async (req, res) => {
    const {
        params: { playlistId, musicId },
    } = req;
    console.log(playlistId, musicId);
    const playlist = await Playlist.findById(playlistId);
    const filteredPlaylistList = playlist.list.filter(
        (v) => String(v) !== String(musicId)
    );
    playlist.list = filteredPlaylistList;
    await playlist.save();
    return res.sendStatus(200);
};

export const getMorePlaylist = async (req, res) => {
    const {
        body: { curPlaylistList },
    } = req;
    const playlist = await Playlist.find();
    const allPlaylist = playlist.filter((v) => v.list.length !== 0);
    const jsonPlaylists = [];
    if (curPlaylistList.length + 7 < allPlaylist.length) {
        // 7개를 더해도 부족할 때
        while (jsonPlaylists.length !== curPlaylistList.length + 7) {
            const randomIndex = Math.floor(Math.random() * allPlaylist.length);
            if (
                curPlaylistList.includes(String(allPlaylist[randomIndex]._id))
            ) {
                continue;
            } else if (jsonPlaylists.includes(allPlaylist[randomIndex])) {
                continue;
            } else {
                jsonPlaylists.push(allPlaylist[randomIndex]);
            }
        }
    } else {
        // 7개를 더하면 전체 플레이리스트 길이보다 클 때
        while (
            jsonPlaylists.length + curPlaylistList.length !==
            allPlaylist.length
        ) {
            const randomIndex = Math.floor(Math.random() * allPlaylist.length);
            if (
                curPlaylistList.includes(String(allPlaylist[randomIndex]._id))
            ) {
                continue;
            } else if (jsonPlaylists.includes(allPlaylist[randomIndex])) {
                continue;
            } else {
                jsonPlaylists.push(allPlaylist[randomIndex]);
            }
        }
    }
    console.log(jsonPlaylists);
    return res.sendStatus(200);
};
