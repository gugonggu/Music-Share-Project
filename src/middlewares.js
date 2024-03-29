export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Chillin on the beat";
    res.locals.loggedInUser = req.session.user || {};
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "먼저 로그인 해야 합니다.");
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};
