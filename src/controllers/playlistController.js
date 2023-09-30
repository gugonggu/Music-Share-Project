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
