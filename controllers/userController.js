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
    }).catch(function(err) {
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
        console.log(err.errors[0].message);
        //err.errors[0].message
        //users.email must be unique : that email is already in use
        //Validation isEmail on email failed : please enter an actual email
        //Validation is on phone failed : please enter only numbers
        //Validation len on phone failed : please enter an 10 or 11 digit number
        //Validation is on username failed : username must only contain letters and numbers
        //Validation len on username failed : username must be between 4 and 24 characters
        //Validation is on password failed : password must only contain letters and numbers
        //Validation len on password failed : password must be between 6 and 24 characters
        //Validation is on address failed : address must only contain letters and numbers
        //Validation len on address failed : please enter an address
        return res.status(500).end();
    });
});

router.post("/login", function (req, res) {
    db.User.findOne({
        where: {
            email: req.body.email,
        }
    }).then(function(foundUser) {
        if (!foundUser) {
            return res.status(404).send("USER NOT FOUND");
        }
        if (!foundUser.isActive){
            return res.status(404).send("Account has been disabled");
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
            return res.status(200).json({ token: token, id : foundUser.id })
        } 
        else {
            return res.status(403).send("wrong password")
        }
    });
});

router.get("/buyer", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
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
    }).then(function(dbUser) {
        return res.json(dbUser);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("an error occurred please try again later");
    });

});

router.get("/baker", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
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
    }).then(function(dbUser) {
        return res.json(dbUser);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("an error occurred please try again later");
    });

});

router.put("/disable", (req, res) => {
    const loggedInUser = checkAuthStatus(req);
    console.log(loggedInUser);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    //console.log({[Op.col]: "baker_id"});
    db.User.findOne({
        where: {
            id: loggedInUser.id
        }
    }).then(function(dbUser) {
        db.User.update({
            isActive: false
        }, {
            where: {
                id: dbUser.id
            }
        }).then(function(editUser) {
            return res.json(editUser);
        }).catch(function(err) {
            console.log(err);
            return res.status(500).send("an error occurred please try again later");
        });
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("an error occurred please try again later");
    });

});

router.get("/profile", function(req, res) {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("invalid token")
    }
    db.User.findOne({
        where: {
            id: loggedInUser.id
        }
    }).then(function(dbUser) {
        return res.json(dbUser);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something went wrong");
    });
});

module.exports = router