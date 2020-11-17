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
    db.Revenue.findAll().then(function(rev) {
        return res.json(rev);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something want wrong");
    });
});

router.get("/:id", function(req, res) {
    db.Revenue.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dbRev) {
        return res.json(dbRev);
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
    db.Revenue.create({
        ingredients: req.body.ingredients,
        sales: req.body.sales,
        month: req.body.month,
        baker_id: loggedInUser.id
    }).then(function(newRev) {
       return res.json(newRev);
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
    db.Revenue.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(rev) {
        if (loggedInUser.id === rev.baker_id) {
            db.Revenue.update({
                ingredients: req.body.ingredients,
                sales: req.body.sales,
                month: req.body.month
            }, {
                    where: {
                        id: rev.id
                    }
                }).then(function(editRev) {
                    return res.json(editRev)
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).send("something want wrong");
                })
        } else {
            return res.status(401).send("not your revenue")
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
    db.Revenue.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(rev) {
        if (loggedInUser.id === rev.baker_id) {
            db.Revenue.destroy({
                where: {
                    id: rev.id
                }
            }).then(function(delRev) {
                return res.json(delRev)
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something want wrong");
            })
        } else {
            return res.status(401).send("not your revenue")
        }
    });
});



module.exports = router