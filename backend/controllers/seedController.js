const { Secure_User_Data_Model } = require("../models/user")
const { UserModel } = require("../models/user")
const { PermissionModel } = require("../models/user")
const bcrypt = require("bcryptjs")

const createSuperAdmin = async () => {
    try {
        const hashPassword = await bcrypt.hash("123", 10)
        await UserModel.findOneAndUpdate(
            { generateUniqueId: "SA" },
            {
                $set: {
                    generateUniqueId: "SA",
                    name:"Rakesh Hankare",
                    roleName: "Superadmin",
                    roleType: "Superadmin",
                    email: "i2s2@gmail.com",
                    createdBy: "default",
                    create_P: true,
                    update_P: true,
                    delete_P: true,
                    edit_P: true,
                    view_P: true,
                    uploadFile_P: true,
                    download_P: true,
                    userID: "SA",
                    password: hashPassword,
                },

            }, { new: true, upsert: true }
        )
        // await PermissionModel.findOneAndUpdate(
        //     { generateUniqueId: "SA" },
        //     {
        //         $set: {
        //             generateUniqueId: "SA",
        //             create_P: true,
        //             update_P: true,
        //             delete_P: true,
        //             edit_P: true,
        //             view_P: true,
        //             uploadFile_P: true,
        //             download_P: true,
        //         },

        //     }, { new: true, upsert: true } 
        // )

        // await Secure_User_Data_Model.findOneAndUpdate(
        //     { generateUniqueId: "SA" },
        //     {
        //         $set: {
        //             generateUniqueId: "SA",
        //             userID: "SA",
        //             password: hashPassword,
        //         }
        //     },
        //    { new: true, upsert: true } 
        // )
        console.log("SUPERADMIN CREATED SUCCESSFULLY")
    } catch (err) {
        console.log("internal error", err)
    }
}


module.exports = createSuperAdmin