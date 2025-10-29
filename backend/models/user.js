const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    roleName: String,
    roleType: { type: String, enum: ["Superadmin", "Admin", "Executive"] },
    name: String,
    mobile: String,
    division: { type: Array },
    email: String,
    assignProduct: { type: Array },
    generateUniqueId: { type: String, unique: true },
    createdBy: String,
    updatedBy: String,
    create_P: { type: Boolean, default: false },
    update_P: { type: Boolean, default: false },
    delete_P: { type: Boolean, default: false },
    edit_P: { type: Boolean, default: false },
    view_P: { type: Boolean, default: false },
    uploadFile_P: { type: Boolean, default: false },
    download_P: { type: Boolean, default: false },
    userID: String,
    password: String,
    isActive: { type: String, enum: ["Active", "Deactive"], default: "Active" },
    master_data_db: {
        excelId: { type: String },
        state: { type: [String], default: [] },
        district: [{ name: String, total: Number }],
        pincode: { type: [String], default: [] },
        clientIds: { type: [String], default: [] },
    }

}, { timestamps: true });

const userHistorSchema = new mongoose.Schema({
    userHistory: { type: Object },
})

// const PermissionSchema = new mongoose.Schema({
//     create_P: { type: Boolean, default: false },
//     update_P: { type: Boolean, default: false },
//     delete_P: { type: Boolean, default: false },
//     edit_P: { type: Boolean, default: false },
//     view_P: { type: Boolean, default: false },
//     uploadFile_P: { type: Boolean, default: false },
//     download_P: { type: Boolean, default: false },
//     generateUniqueId: { type: String, unique: true },
//     authorizedBy: { type: String, default: "Super Admin" }
// })

// const Secure_User_Data_Schema = new mongoose.Schema({
//     userID: String,
//     password: String,
//     confirmPassword: String,
//     generateUniqueId: { type: String, unique: true },
//     authorizedBy: { type: String, default: "Super Admin" }
// })


const UserModel = mongoose.model("UserModel", UserSchema);
const userHistorModel = mongoose.model("userHistorModel", userHistorSchema);
// const PermissionModel = mongoose.model("PermissionModel", PermissionSchema);
// const Secure_User_Data_Model = mongoose.model("Secure_User_Data_Model", Secure_User_Data_Schema);

module.exports = { UserModel, userHistorModel }; 
