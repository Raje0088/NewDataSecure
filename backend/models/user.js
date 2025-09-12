const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    roleName: String,
    name: String,
    mobile: String,
    division: [String],
    email: String,
    assignProduct: [String],
    generateUniqueId: { type: String, unique: true },
    createdBy:String,
    permission:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"PermissionModel",
    }
});

const PermissionSchema = new mongoose.Schema({
    create_P: { type: Boolean, default: false },
    update_P: { type: Boolean, default: false },
    delete_P: { type: Boolean, default: false },
    edit_P: { type: Boolean, default: false },
    view_P: { type: Boolean, default: false },
    uploadFile_P: { type: Boolean, default: false },
    download_P: { type: Boolean, default: false },
    generateUniqueId: { type: String, unique: true },
    authorizedBy: { type: String, default: "Super Admin" }
})

const Secure_User_Data_Schema = new mongoose.Schema({
    userID: String,
    password: String,
    confirmPassword: String,
    generateUniqueId: { type: String, unique: true },
    authorizedBy: { type: String, default: "Super Admin" }
})

// ✅ Prevent OverwriteModelError during hot-reloads (nodemon)
// const UserModel = mongoose.models.UserModel || mongoose.model("UserModel", UserSchema);

const UserModel = mongoose.model("UserModel", UserSchema);
const PermissionModel = mongoose.model("PermissionModel", PermissionSchema);
const Secure_User_Data_Model = mongoose.model("Secure_User_Data_Model", Secure_User_Data_Schema);

module.exports = { UserModel, PermissionModel, Secure_User_Data_Model }; 
