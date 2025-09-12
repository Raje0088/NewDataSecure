const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path")
const { updateLatterPincode, fetchPlaceRawDB, deleteLatterPincode, searchPincode, getLatterPincode,sampleExcelFile, getStateDistrictVillageName, createPincode } = require("../controllers/pincodeControler.js")

const { uploadPincodeExcel } = require("../ZDUMPING/pincodeController.js")

router.get("/search-pincode", searchPincode)
router.get("/fetch-pincode-rawdb", fetchPlaceRawDB)
router.get("/search-getplaces", getStateDistrictVillageName)

router.post("/create-pincode", createPincode);
router.put("/update-pincode", updateLatterPincode);
router.get("/search-pincode-setting", getLatterPincode);
router.delete("/delete-pincode-setting", deleteLatterPincode);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./ZDUMPING/files");
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

router.post("/dump", upload.single("excelPincode"), (req, res) => {
    const filename = req.file.filename;
    res.status(202).json({ message: "Upload received", filename })
});
router.get("/progress/:filename", uploadPincodeExcel);
router.get("/sampleFile", sampleExcelFile);


module.exports = router;