const express = require("express");
const router = express.Router();

const userRoutes = require("./userController");
const orderRoutes = require("./orderController");
const preMadeRoutes = require("./preMadeController");
const inventoryRoutes = require("./inventoryController");
const pricingRoutes = require("./pricingController");
const revenueRoutes = require("./revenueController");
const invChangesRoutes = require("./invChangesController");

router.get("/",(req,res)=>{
    res.send("welcome to the pantry")
})

router.use("/api/users",userRoutes);
router.use("/api/orders",orderRoutes);
router.use("/api/premade",preMadeRoutes);
router.use("/api/inventory",inventoryRoutes);
router.use("/api/pricing",pricingRoutes);
router.use("/api/revenue",revenueRoutes);
router.use("/api/invchanges",invChangesRoutes);

module.exports = router