import User from "../models/User";
import Music from "../models/Music";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import { async } from "regenerator-runtime";

export const getJoin = (req, res) => {
    res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
    const { name, username, email, password, confirmPassword } = req.body;
    const pageTitle = "Join";
    if (password !== confirmPassword) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "비밀번호가 맞지 않습니다.",
        });
    }
    const exists = await User.exists({
        $or: [{ username: req.body.username }, { email: req.body.email }],
    });
    if (exists) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "이미 존재하는 닉네임 / 이메일 입니다.",
        });
    }
    try {
        await User.create({
            name,
            username,
            email,
            password,
        });
        return res.redirect("/login");
    } catch (error) {
        return res
            .status(400)
            .render("join", { pageTitle, errorMessage: error._message });
    }
};

export const getLogin = (req, res) => {
    return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
    const { email, password } = req.body;
    const pageTitle = "Login";
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "이 이메일로 생성된 계정을 찾을 수 없습니다.",
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "틀린 비밀번호 입니다.",
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
};

export const logout = (req, res) => {
    req.flash("info", "Bye Bye");
    req.session.destroy();
    return res.redirect("/");
};

export const getEdit = (req, res) => {
    return res.render("users/edit-profile", { pageTitle: "Edit profile" });
};

export const postEdit = async (req, res) => {
    const {
        session: {
            user: { _id, email: sessionEmail, username: sessionUsername },
        },
        body: { name, email, username },
    } = req;
    let searchParam = [];
    if (sessionEmail !== email) {
        searchParam.push({ email });
    }
    if (sessionUsername !== username) {
        searchParam.push({ username });
    }
    if (searchParam.length > 0) {
        const foundUser = await User.findOne({ $or: searchParam });
        if (foundUser && foundUser._id.toString() !== _id) {
            return res.status(400).render("users/edit-profile", {
                pageTitle: "Edit Profile",
                errorMessage: "이미 존재하는 닉네임/이메일 입니다.",
            });
        }
    }
    const updatedUser = await User.findByIdAndUpdate(
        _id,
        {
            name: name,
            email: email,
            username: username,
        },
        { new: true }
    );
    req.session.user = updatedUser;
    res.redirect("/users/edit-profile");
};

export const getChangePassword = async (req, res) => {
    return res.render("users/change-password", {
        pageTitle: "Change Password",
    });
};

export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation },
    } = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "현재 비밀번호가 맞지 않습니다.",
        });
    }
    if (newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "비밀번호가 맞지 않습니다.",
        });
    }
    user.password = newPassword;
    await user.save();
    req.flash("info", "Password updated");
    return res.redirect("/logout");
};

export const myMusics = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id).populate("musics");
    return res.render("users/my-musics", {
        pageTitle: "My Musics",
        user,
    });
};

export const getSound = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.sendStatus(404);
    }
    const value = user.soundValue;
    return res.status(200).json({ value: value });
};

export const postSound = async (req, res) => {
    const {
        body: { value },
        params: { id },
    } = req;
    const user = await User.findById(id);
    if (!user) {
        return res.sendStatus(404);
    }
    user.soundValue = value;
    user.save();
    return res.sendStatus(200);
};
