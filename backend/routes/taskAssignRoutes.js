const express = require("express")
const router = express.Router()

const { assignClient, getAssignByAssignTo } = require("../controllers/TaskAssignControllers")

router.post("/task-assign", assignClient)
router.get("/get-clientids-assign-by-to/:userId", getAssignByAssignTo)

module.exports = router;