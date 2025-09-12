const express = require("express")
const router = express.Router()
const {getAllUserSubsriptionIds,filterClientSubscriptionData,CheckUserIdforExcelSheet,CheckUserSubsciptionToRedirect,createSubscripbeUser,updateUserScription,searchUserSubsciption} = require("../controllers/clientSubscriptionControlller")

router.post("/create-subscribe-user",createSubscripbeUser)
router.put("/update-subscribe-user/:id",updateUserScription)
router.get("/search-subscribe-user/:id",searchUserSubsciption)
router.get("/check-user-subscription/:id",CheckUserSubsciptionToRedirect)
router.get("/get-usersubscribeids",getAllUserSubsriptionIds)
router.get("/filter-clientsubscribedata",filterClientSubscriptionData)
router.get("/checkuseridpresent/:id",CheckUserIdforExcelSheet)

module.exports = router      