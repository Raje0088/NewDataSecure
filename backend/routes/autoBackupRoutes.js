const express = require("express")

const router = express.Router()
const multer = require("multer");
const path = require("path")
const {restoreBackup, creatAutoBackupEmails, updateAutoBackupEmails, getAutoBackupEmails, deleteAutoBackupEmails ,takeBackup, deleteEntireDatabase} = require("../controllers/autoBackupController")

router.post("/backup-emails", creatAutoBackupEmails);
router.put("/update-backup-emails/:id", updateAutoBackupEmails);
router.delete("/delete-backup-emails/:id",deleteAutoBackupEmails );
router.get("/get-backup-emails", getAutoBackupEmails);
router.post("/takeBackup", takeBackup);
router.delete("/delete-entire-db", deleteEntireDatabase);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(process.cwd(), "uploadExcel")
    cb(null, uploadPath)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname)
  }
})

const upload = multer({ storage: storage })

router.post("/restoreBackup",upload.single("restore"), restoreBackup);
module.exports = router