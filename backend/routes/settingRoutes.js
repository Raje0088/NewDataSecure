const express = require("express");
const router = express.Router();
const {getSuperAdminAllProduct, divisionField,updateAssignProductField,deleteAssignProductField,deleteDivisionField,getAssignProductField, roleNameField, updateDivisionField, getDivisionField, assignProductField, getRoleNameField, updateRoleNameField, deleteRoleNameField } = require("../controllers/settingController.js")

router.post("/rolename", roleNameField)
router.get("/rolename-data", getRoleNameField)
router.put("/update-rolename/:id", updateRoleNameField)
router.delete("/delete-rolename/:id", deleteRoleNameField)

router.post("/division", divisionField)
router.get("/division-data", getDivisionField)
router.put("/update-division/:id", updateDivisionField)
router.delete("/delete-division/:id", deleteDivisionField)

router.post("/assignproduct", assignProductField)
router.get("/assignproduct-data/:id", getAssignProductField)
router.put("/update-assign-product/:id", updateAssignProductField)
router.delete("/delete-assign-product/:id", deleteAssignProductField)
router.get("/get-superadmin-product", getSuperAdminAllProduct)




module.exports = router;