const express = require("express")
const router = express.Router()
const {getRemainders,getCompleteRemainer} = require("../controllers/remainderController")

router.get("/remainder",getRemainders)
router.put("/status/:id",getCompleteRemainer)
module.exports = router