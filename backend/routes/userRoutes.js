const express = require("express");
// const { UserModel } = require("../models/user.js");
const router = express.Router();
const {createUser,updateUser,getAllUsers} = require("../controllers/userController.js")
const {addPermission, updatePermission} = require("../controllers/userController.js")
const {UserIdAndPassword,userIdExist,getNextUserId} = require("../controllers/userController.js")
const {searchByUserModel,searchByPermissionModel,searchByUserIdPasswordModel} =require("../controllers/userController.js");
const {searchAllUser,searchUserByNameorMobileorEmail,searchAllPermission,searchAllId,updateUserIdAndPassword,deleteUser,deletePermssion,deleteUserIdPassword} =require("../controllers/userController.js");
const {saveUserForm,updateUserForm,deleteUserForm,searchUserFormId,getTotalCountDetailsForUserForm} = require("../controllers/userTaskController.js")

//UserCreate Route
router.post('/createUser',createUser)
router.put("/updateUser/:id",updateUser )
router.get("/getUser",getAllUsers)
router.delete("/delete-user/:id",deleteUser )
router.delete("/delete-permission/:id",deletePermssion )
router.delete("/delete-userIdAndPassword/:id",deleteUserIdPassword )
//Permsission Route
router.post("/checked",addPermission);
router.put("/updateChecked/:id",updatePermission);

router.post("/userIdPassAuth",UserIdAndPassword)
router.put("/update-userIdPassAuth/:id",updateUserIdAndPassword)

//Id generator routes
router.get("/checked-userId",userIdExist);
router.get("/search-through-mobile-email-name",searchUserByNameorMobileorEmail);
router.get("/next-id",getNextUserId);

//Searching Route
router.get("/search-by-user/:id",searchByUserModel)
router.get("/search-by-permission/:id",searchByPermissionModel)
router.get("/search-by-userid-and-password/:id",searchByUserIdPasswordModel)

router.get("/search-all-user",searchAllUser)
router.get("/search-all-permission",searchAllPermission)
router.get("/search-all-userid-and-password",searchAllId)


// ==============USER FORM ROUTES ======================
router.post("/user-task-form",saveUserForm)
router.put("/updateuser-task-form/:id",updateUserForm)
router.delete("/deleteuser-task-form/:id",deleteUserForm)
router.get("/searchuser-task-form/:id",searchUserFormId)

// ==============USER FORM ROUTES ======================
router.get("/get-extratask-result/:userId",getTotalCountDetailsForUserForm)
 
module.exports = router