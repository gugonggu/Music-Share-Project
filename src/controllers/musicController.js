import Music from "../models/Music";
import User from "../models/User";

export const home = (req, res) => {
    // const musics = await Music.find({})
    
    return res.render("home", {pageTitle: "Home"});
};