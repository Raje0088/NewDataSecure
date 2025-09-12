const { UserModel, PermissionModel } = require("../models/user")

const checkPermissions = (permissionKey) => {
    return async (req, res, next) => {
        try {
            if (req.method === "OPTIONS") return next();

            const userUniqueId = req.headers['generateuniqueid'];
            console.log("userUniqueId from checkpermission", userUniqueId);
            if (!userUniqueId) return res.status(401).json({ message: "User ID missing" });

            const user = await UserModel.findOne({ generateUniqueId: userUniqueId });
            if (!user) return res.status(404).json({ message: "User not found" })

            if (user.role === "superadmin") return next();

            const permission = await PermissionModel.findOne({ generateUniqueId: userUniqueId })
            if (!permission || !permission[permissionKey]) return res.status(403).json({ message: "Permission denied for" + permissionKey })

            next();
        } catch (err) {
            console.log("Permission check failed:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}


module.exports = { checkPermissions }