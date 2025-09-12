// const jwt = require("jsonwebtoken");

// module.exports = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     console.log("Auth Header:", authHeader); // log here

//     const token = authHeader?.split(" ")[1];
//     if (!token) return res.status(401).json({ msg: "No token" });

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         console.log("Decoded Token:", decoded); // log here
//         next();
//     } catch (err) {
//         console.log("JWT Error:", err.message);
//         res.status(401).json({ msg: "Invalid token" });
//     }
// }
