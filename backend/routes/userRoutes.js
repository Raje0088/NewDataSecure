const express = require("express");
// const { UserModel } = require("../models/user.js");
const router = express.Router();
const {createUser,updateUser,getAllUser,searchUserById, filterUserBySearch,userIdExist,deleteUser, getUserHistory} = require("../controllers/userController.js")
const {saveUserForm,searchUserTaskFormId,getUserAssignFormHistory} = require("../controllers/userTaskController.js")
//UserCreate Route
router.post('/createUser',createUser)
router.put("/updateUser/:id",updateUser )
router.get("/search-all-user",getAllUser)
router.get("/search-by-user/:id",searchUserById)
router.get("/filter-user",filterUserBySearch)
router.get("/checked-userId",userIdExist);
router.delete("/delete-user/:id",deleteUser )
router.get("/user-history/:id",getUserHistory)

// router.get("/getUser",getAllUsers)

//Permsission Route
// router.delete("/delete-userIdAndPassword/:id",deleteUserIdPassword )
// router.delete("/delete-permission/:id",deletePermssion )
// router.post("/checked",addPermission);
// router.put("/updateChecked/:id",updatePermission);

// router.post("/userIdPassAuth",UserIdAndPassword)
// router.put("/update-userIdPassAuth/:id",updateUserIdAndPassword)

// //Id generator routes
// router.get("/search-through-mobile-email-name",searchUserByNameorMobileorEmail);
// router.get("/next-id",getNextUserId);

// //Searching Route

// router.get("/search-by-permission/:id",searchByPermissionModel)
// router.get("/search-by-userid-and-password/:id",searchByUserIdPasswordModel)


// router.get("/search-all-permission",searchAllPermission)
// router.get("/search-all-userid-and-password",searchAllId)


// // ==============USER FORM ROUTES ======================
router.post("/user-task-form",saveUserForm)
router.get("/get-userForm/:id",searchUserTaskFormId)
router.get("/get-userForm-history/:id",getUserAssignFormHistory)
// router.put("/updateuser-task-form/:id",updateUserForm)
// router.delete("/deleteuser-task-form/:id",deleteUserForm)
// router.get("/searchuser-task-form/:id",searchUserFormId)

// // ==============USER FORM ROUTES ======================


 
module.exports = router