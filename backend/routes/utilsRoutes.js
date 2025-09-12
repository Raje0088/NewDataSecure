const express = require("express");
const router = express.Router();
const {getGenerateUserId} = require("../utils/generateUserId")
const {excelDownloadController} = require("../utils/generateExcel")

router.post("/send-user-id",getGenerateUserId)
router.post("/excel-download",excelDownloadController)

module.exports = router