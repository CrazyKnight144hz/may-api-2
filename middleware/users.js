const jwt = require("jsonwebtoken");

module.exports = {
    validateRegister: (req, res, next) => {
        if (!req.body.username || req.body.username.length < 4) {
            return res.status(400).send({
                message: "Username must be at least 4 characters",
            });
        }

        if(!req.body.password || req.body.password.length < 6) {
            return res.status(400).send({
                message: "Password must be at least 6 characters",
            });
        }

        if(!req.body.password_repeat || req.body.password != req.body.password_repeat) {
            return res.status(400).send({
                message: "Password must Match",
            });
        }

        next();
    },
};