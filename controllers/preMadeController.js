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
    db.PreMade.findAll().then(function(pre) {
        return res.json(pre);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something want wrong");
    });
});

router.get("/:id", function(req, res) {
    db.PreMade.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dbPre) {
        return res.json(dbPre);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something want wrong");
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
    db.PreMade.create({
        name: req.body.name,
        price: req.body.price,
        ingredients: req.body.ingredients,
        description: req.body.description,
        img: req.body.img,
        baker_id: loggedInUser.id
    }).then(function(newInv) {
       return res.json(newInv);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something want wrong");
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
    db.PreMade.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(pre) {
        if (loggedInUser.id === pre.baker_id) {
            db.PreMade.update({
                name: req.body.name,
                price: req.body.price,
                ingredients: req.body.ingredients,
                description: req.body.description,
                img: req.body.img
            }, {
                    where: {
                        id: pre.id
                    }
                }).then(function(editPre) {
                    return res.json(editPre)
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).send("something want wrong");
                })
        } else {
            return res.status(401).send("not your baked goods")
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
    db.PreMade.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(pre) {
        if (loggedInUser.id === pre.baker_id) {
            db.PreMade.destroy({
                where: {
                    id: pre.id
                }
            }).then(function(delPre) {
                return res.json(delPre)
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something want wrong");
            })
        } else {
            return res.status(401).send("not your baked goods")
        }
    });
});



module.exports = router