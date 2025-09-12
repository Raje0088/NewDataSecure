// const express = require("express")
// const {register,login, updateStatus} =require('../controllers/authControllers.js')
// const authMiddleware = require('../middleware/authMiddleware');
// const role = require('../middleware/roleMiddleware');

// const router = express.Router();

// // Public
// // router.post('/register',register);
// router.post('/login',login);

// // Superadmin only
// router.put('/update-status',authMiddleware,role('superadmin'),updateStatus);
// router.post("/register", authMiddleware, role("superadmin"), register);
// module.exports = router
