const express = require("express")
const router = express.Router();
const {createPaymentHistory,getPaymentHistory }= require("../controllers/paymentHistoryController")

router.post("/history",createPaymentHistory)
router.get("/receipt/:id",getPaymentHistory)

module.exports = router;