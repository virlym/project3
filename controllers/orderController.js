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
    db.Order.findAll().then(function(inv) {
        return res.json(inv);
    }).catch(function(err) {
        console.log(err);
        return res.status(500).send("something want wrong");
    });
});

router.get("/:id", function(req, res) {
    db.Order.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(dbOrder) {
        return res.json(dbOrder);
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
    console.log(loggedInUser);
    db.Order.findOne({
        where:{
            id:req.body.id
        }
    }).then(function(orderData) {
        if(orderData.buyer_id === loggedInUser.id){
            db.Order.create({
                sale: req.body.sale,
                ingredients: req.body.ingredients,
                deadline: req.body.deadline,
                status: req.body.status,
                description: req.body.description,
                baker_id: req.body.baker_id,
                buyer_id: loggedInUser.id
            }).then(function(newInv) {
               return res.json(newInv);
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something want wrong");
            })
        } else{
            return res.status(401).send("not your order")
        }
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
    db.Order.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(order) {
        if (loggedInUser.id === order.baker_id) {
            db.Order.update({
                sale: req.body.sale,
                ingredients: req.body.ingredients,
                deadline: req.body.deadline,
                status: req.body.status,
                description: req.body.description
            }, {
                    where: {
                        id: order.id
                    }
                }).then(function(editOrder) {
                    return res.json(editOrder)
                }).catch(function(err) {
                    console.log(err);
                    return res.status(500).send("something want wrong");
                })
        } else {
            return res.status(401).send("not your order")
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
    db.Order.findOne({
        where: {
            id: req.params.id
        }
    }).then(function(inv) {
        if (loggedInUser.id === inv.baker_id) {
            db.Order.destroy({
                where: {
                    id: inv.id
                }
            }).then(function(delOrder) {
                return res.json(delOrder)
            }).catch(function(err) {
                console.log(err);
                return res.status(500).send("something want wrong");
            })
        } else {
            return res.status(401).send("not your order")
        }
    });
});



module.exports = router