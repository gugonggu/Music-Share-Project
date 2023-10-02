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
    const playlist = await Playlist.findById(id).populate("meta.creator");
    return res.render("playlist", {
        pageTitle: playlist.title,
        playlist,
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
