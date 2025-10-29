const express = require("express");
const router = express.Router();
const { checkPermissions } = require("../middleware/checkPermission.js")
const { GenerateClientSerialNumber, searchByClientId, searchAllClientsThroughQuery,
     createClient, updateClient, getCheckClientIdPresent, filterClientData, CheckClientIdforExcelSheet,deactivateClientData } = require("../controllers/clientController.js")

const { updateDataMergeAndDelete } = require("../controllers/DuplicateAndMergeDataController.js")
const { getClientsAssignedToEmployee } = require("../controllers/clientController");
router.get("/assigned-clients/:userId", getClientsAssignedToEmployee);


router.get("/generate-serial-client-id", GenerateClientSerialNumber)
// router.post("/create-client-detail",createClient);
// router.get("/search-client-history", getClientHistory)

// router.post("/create-client-detail",createClient)
router.post("/create-client-detail", createClient)
router.put("/update-client/:id", updateClient);

//to check is client id present in client db or not
router.get("/check-clientid-present/:id", getCheckClientIdPresent)
router.get("/search-client-id/:id", searchByClientId)
router.get("/search-allclient-match", searchAllClientsThroughQuery)
router.post("/filter-clientdata", filterClientData)
router.get("/checkclientIdforexcelsheet/:id", CheckClientIdforExcelSheet)
router.put("/deactivate-client/:id", deactivateClientData)

router.post("/updateclient-merge-delete", updateDataMergeAndDelete)

module.exports = router;