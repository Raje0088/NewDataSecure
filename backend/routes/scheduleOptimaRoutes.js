const express= require("express")
const router = express.Router();
const {setGoals,getScheduleOptima} = require("../controllers/ScheduleOptimaControllers")

router.post("/goal",setGoals)
router.get("/get-goals/:id",getScheduleOptima)

module.exports = router 