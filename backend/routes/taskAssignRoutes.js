const express = require("express")
const router = express.Router()

const { assignClient,removeAssignArea,assignTaskAcceptRejectRequest,removeAssignExcelSheet, getAssignTaskUserConfiguration,getExcelDumpClientIdAssignTask,getUserAssignTask ,cancelAssignTaskBySA,deleteAssignTaskBySA} = require("../controllers/TaskAssignControllers")

router.post("/task-assign", assignClient)
router.get("/get-assign-task/:id", getUserAssignTask)
router.get("/get-assign-task-cancel/:id", cancelAssignTaskBySA)
router.delete("/delete-assign-task/:id", deleteAssignTaskBySA)
router.get("/task-request", assignTaskAcceptRejectRequest)
router.get("/get-task-userconfig", getAssignTaskUserConfiguration)
router.get("/get-excelid", getExcelDumpClientIdAssignTask)
router.put("/remove-assignarea/:id", removeAssignArea)
router.put("/remove-assignexcel", removeAssignExcelSheet)

module.exports = router;

