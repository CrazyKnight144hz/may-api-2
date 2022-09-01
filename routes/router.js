const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");

const db = require("../lib/db.js");
const { validateRegister } = require("../middleware/users.js");

module.exports = router;

// http://[serverip]:[PORT]/MayAPI/sing-up
router.post("/sing-up", validateRegister, (req, res, next) => {
    let sql = `SELECT id FROM users WHERE LOWER(username) = LOWER(${req.body.username})`;
    db.query(sql, (err, result) => {
        console.log(result);
        if(result) {
            return res.status(409).send({
                message: "Username already registered!",
            });
        }else{
            let sql = `SELECT id FROM users WHERE LOWER(email) = LOWER(${req.body.email})`;
            db.query(sql, (err, result) => {
                if(result) {
                    return res.status(409).send({
                        message: "Email already registered!",
                    });
                }else{
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if(err){
                            throw err;
                            return res.status(500).send({
                                message: err,
                            });
                        }else{
                            let sql = `INSERT INTO users (id, username, email, password, registered) VALUES ("${uuid.v4()}","${db.escape(req.body.username)}", "${db.escape(req.body.email)}", "${hash}", now());`;
                            db.query(sql, (err, result) => {
                                    if(err){
                                        throw err;
                                        return res.status(400).send({
                                            message: err,
                                        });
                                    }
                                    return res.status(201).send({
                                        message: "Registered!",
                                    });
                                 }
                            );
                        }
                    })
                }
            });
        }
    })
})



// http://[serverip]:[PORT]/MayAPI/login
router.post("/login", (req, res, next) => {
    let sql = `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`;
    db.query(sql, (err, result) => {
        if(err){
            throw err;
            return res.status(400).send({
                message: err,
            });
        }
        if(!result.length){
            return res.status(400).send({
                message: "Email is incorrect!",
            });
        }

        bcrypt.compare(req.body.password, result[0]["password"], (bErr, bresult) => {
            if(bErr){
                throw bErr;
                return res.status(400).send({
                    message: "Password is incorrect!",
                });
            }
            if(bresult){
                const token = jwt.sign(
                    {
                        username: result[0].username,
                        userId: result[0].id,
                    },
                    "SECRETKEY",
                    { expiresIn: "7d"}
                );
                let sql = `UPDATE users SET last_login = now() WHERE id = ${result[0].id};`;
                db.query(sql);

                return res.status(200).send({
                    message: "Logged in!",
                    token,
                    user: result[0]
                });
            }
            return res.status(400).send({
                message: "Email or password is incorrect!",
            });
        })
    })
})
// http://[serverip]:[PORT]/MayAPI/secret-route

router.get("/secret-route", (req, res, next) => {

})