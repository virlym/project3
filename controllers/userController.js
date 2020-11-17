const express = require("express");
const router = express.Router();
const db = require('../models')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

function checkAuthStatus (request) {
    //console.log(request.headers);
    if (!request.headers.authorization) {
        return false
    }
    const token = request.headers.authorization.split(" ")[1]
    //console.log(token);
    const loggedInUser = jwt.verify(token, process.env.JWT_SECRET, function (err, data) {
        if (err) {
            return false
        }
        else {
            return data
        }
    });
    //console.log(loggedInUser)
    return loggedInUser
}


router.get("/", function (req, res) {
    db.User.findAll().then( function (dbUsers) {
        return res.json(dbUsers);
    }).catch(err => {
        console.log(err);
        return res.status(500).end();
    });
});

router.post("/", function (req, res) {
    db.User.create({
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
        address: req.body.address,
        phone: req.body.phone,
        isOwner: req.body.isOwner
    }).then(function(newUser) {
        return res.json(newUser);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).end();
    });
});

router.post("/login", function (req, res) {
    db.User.findOne({
        where: {
            email: req.body.email,
        }
    }).then(foundUser => {
        if (!foundUser) {
            return res.status(404).send("USER NOT FOUND")
        }
        if (bcrypt.compareSync(req.body.password, foundUser.password)) {
            const userTokenInfo = {
                email: foundUser.email,
                id: foundUser.id,
                username: foundUser.name,
                address: foundUser.address,
                phone: foundUser.phone,
                isOwner: foundUser.isOwner
            }
            const token = jwt.sign(userTokenInfo, process.env.JWT_SECRET, { expiresIn: "2h" });
            return res.status(200).json({ token: token })
        } else {
            return res.status(403).send("wrong password")
        }
    });
});

router.get("/buyerProfile", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    console.log(loggedInUser);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    if (loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    db.User.findOne({
        where: {
            id: loggedInUser.id
        },
        include: [{
            model: db.Order,
            on: {buyer_id: loggedInUser.id},
            include:[{
                model: db.User,
                on: {'id': {[Op.col]: 'baker_id'}},
                attributes:['address', 'email', 'phone']
            }]
        }]
    }).then(dbUser => {
        return res.json(dbUser)
    }).catch(err => {
        console.log(err);
        return res.status(500).send("an error occurred please try again later");
    });

});

router.get("/bakerProfile", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    console.log(loggedInUser);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    console.log({[Op.col]: "baker_id"});
    db.User.findOne({
        where: {
            id: loggedInUser.id
        },
        include: [
            {
                model: db.Order,
                on: {baker_id: loggedInUser.id},
                include:[{
                    model: db.User,
                    attributes:['address', 'email', 'phone']
                }]
            },
            {
                model: db.Inventory,
                on: {baker_id: loggedInUser.id},
            },
            {
                model: db.InvChanges,
                on: {baker_id: loggedInUser.id},
            },
            {
                model: db.PreMade,
                on: {baker_id: loggedInUser.id},
            },
            {
                model: db.Pricing,
                on: {baker_id: loggedInUser.id},
            },
            {
                model: db.Revenue,
                on: {baker_id: loggedInUser.id},
            }
        ]
    }).then(dbUser => {
        return res.json(dbUser)
    }).catch(err => {
        console.log(err);
        return res.status(500).send("an error occurred please try again later");
    });

});

module.exports = router