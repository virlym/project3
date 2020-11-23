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
    db.Inventory.findAll().then(function(inv) {
        return res.json(inv);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something went wrong");
    });
});

router.get("/:id", function(req, res) {
    db.Inventory.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dbInv) {
        return res.json(dbInv);
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
    db.Inventory.create({
        name: req.body.name,
        quantity: req.body.quantity,
        metric: req.body.metric,
        baker_id: loggedInUser.id
    }).then(function(newInv) {
       return res.json(newInv);
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
    db.Inventory.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(inv) {
        if (loggedInUser.id === inv.baker_id) {
            db.Inventory.update({
                name: req.body.name,
                quantity: req.body.quantity,
                metric: req.body.metric
            }, {
                    where: {
                        id: inv.id
                    }
                }).then(function(editInv) {
                    return res.json(editInv)
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).send("something went wrong");
                })
        } else {
            return res.status(401).send("not your inventory")
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
    db.Inventory.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(inv) {
        if (loggedInUser.id === inv.baker_id) {
            db.Inventory.destroy({
                where: {
                    id: inv.id
                }
            }).then(function(delInv) {
                return res.json(delInv)
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something went wrong");
            })
        } else {
            return res.status(401).send("not your inventory")
        }
    });
});



module.exports = router