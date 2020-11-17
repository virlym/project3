const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const db = require('../models')

function checkAuthStatus(request) {
    if (!request.headers.authorization) {
        return false
    }
    const token = request.headers.authorization.split(" ")[1]

    const loggedInUser = jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
        if (err) {
            return false
        }
        else {
            return data
        }
    });
    console.log(loggedInUser)
    return loggedInUser
}



router.get("/", function(req, res) {
    db.Pricing.findAll().then(function(inv) {
        return res.json(inv);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something went wrong");
    });
});

router.get("/:id", function(req, res) {
    db.Pricing.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dbPrice) {
        return res.json(dbPrice);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something went wrong");
    });
});

router.post("/", function(req, res) {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("login first")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    console.log(loggedInUser);
    db.Pricing.create({
        name: req.body.name,
        price: req.body.price,
        type: req.body.type,
        baker_id: loggedInUser.id
    }).then(function(newPrice) {
       return res.json(newPrice);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something went wrong");
    });
});

router.put("/:id", function(req, res) {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("login first")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    db.Pricing.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(price) {
        if (loggedInUser.id === price.baker_id) {
            db.Pricing.update({
                name: req.body.name,
                price: req.body.price,
                type: req.body.type
            }, {
                    where: {
                        id: price.id
                    }
                }).then(function(editPrice) {
                    return res.json(editPrice)
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).send("something went wrong");
                })
        } else {
            return res.status(401).send("not your prices")
        }
    });
});

router.delete("/:id", function(req, res) {
    const loggedInUser = checkAuthStatus(req);
    if (!loggedInUser) {
        return res.status(401).send("login first")
    }
    if (!loggedInUser.isOwner){
        return res.status(401).send("invalid user path");
    }
    db.Pricing.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(price) {
        if (loggedInUser.id === price.baker_id) {
            db.Pricing.destroy({
                where: {
                    id: price.id
                }
            }).then(function(delPrice) {
                return res.json(delPrice)
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something went wrong");
            })
        } else {
            return res.status(401).send("not your prices")
        }
    });
});



module.exports = router