const { UserModel } = require("../models/user.js")
const { PermissionModel } = require("../models/user.js");
const { Secure_User_Data_Model } = require("../models/user.js");
const { generateUserId } = require("../utils/generateUserId.js")
const bcrypt = require('bcryptjs');



const createUser = async (req, res) => {
    try {
        console.log("REQ BODY:", req.body);
        const { roleName, name, mobile, division, email, assignProduct, createdById } = req.body;
        const generateUniqueId = await generateUserId(roleName, createdById);
        console.log("generatedUniqueId yo", generateUniqueId)
        const result = await UserModel.create(
            { roleName, name, mobile, division, email, assignProduct,
                 generateUniqueId: generateUniqueId, createdBy: createdById }
        );
        console.log("User Created Successfully");
        res.status(201).json({ message: "User Created Successfully", user: result });
    } catch (err) {
        console.log("User Not Created", err);
        res.status(500).json({ message: "User Not Created", err: err.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { roleName, name, mobile, division, email, assignProduct } = req.body;
        const result = await UserModel.findOneAndUpdate(
            { generateUniqueId: id },
            {
                "$set":
                {
                    roleName,
                    name,
                    mobile,
                    division,
                    email,
                    assignProduct,

                }
            },
            { new: true } // return updated document
        )
        console.log("User updated successfully")
        res.status(200).json({ message: "User updated successfully", user: result })
    } catch (err) {
        console.log("User not updated");
        res.status(500).json({ message: "user not updated", err: err.message })
    }
}
const getAllUsers = async (req, res) => {
    try {
        const result = await UserModel.find();
        console.log("User Data Displayed Successfully")
        res.status(200).json({ message: "User Data Displayed Successfully", usersdf: result });
    } catch (err) {
        console.log("User Not Displayed")
        res.status(500).json({ err: err.message });
    }
}

const addPermission = async (req, res) => {
    try {
        const { generateUniqueId, create_P, update_P, delete_P, edit_P, view_P, uploadFile_P, download_P, } = req.body;
       if(!generateUniqueId) return res.status(404).json({message:"generateUniqueid required in permission"})
        const permission = await PermissionModel.create({
            create_P,
            update_P,
            delete_P,
            edit_P,
            view_P,
            uploadFile_P,
            download_P,
            generateUniqueId: generateUniqueId,

        });

        // 2. Link this permission to the user
        const updatedUser = await UserModel.findOneAndUpdate(
            { generateUniqueId: generateUniqueId },
            { $set: { permission: permission._id } },
            { new: true },
        )
        console.log("Permission add successfully", permission);
        console.log("Permission added and linked to user:", updatedUser.name);
        res.status(200).json({
            message: "Permission added and linked to user successfully",
            permission,
            updatedUser
        });
    } catch (err) {
        console.log("Checked failed", err);
        res.status(500).json({ message: "Checked failed", err: err.message })
    }
}
const updatePermission = async (req, res) => {
    try {
        const { create_P, update_P, delete_P, edit_P, view_P, uploadFile_P, download_P, } = req.body;
        const id = req.params.id;
        const result = await PermissionModel.findOneAndUpdate(
            { generateUniqueId: id },
            {
                "$set": {
                    create_P, update_P,
                    delete_P, edit_P,
                    view_P, uploadFile_P,
                    download_P
                }
            },
            { new: true }
        )
        console.log("persmission  updated", result)
        res.status(200).json({ message: "persmission updated", result })
    } catch (err) {
        console.log("persmission not updated", err)
        res.status(500).json({ message: "persmission not updated", err: err.message })
    }
}

const updateUserIdAndPassword = async (req, res) => {
    try {
        const { username, password, confirmPassword } = req.body;
        const id = req.params.id;
        const updateData = {
            password,
            confirmPassword
        }
        if (username && username !== "unchanged") {
            updateData.userID = username
        }
        const saltRounds = 10
        const hashPassword = await bcrypt.hash(password,saltRounds)
        const result = await Secure_User_Data_Model.findOneAndUpdate(
            { generateUniqueId: id },
            {
                "$set": {
                    userID: username,
                    password: hashPassword,
                    confirmPassword: hashPassword
                }
            },
            { new: true }
        )
        console.log("id and password  updated", result)
        res.status(200).json({ message: "id and password   updated", result })
    } catch (err) {
        console.log("id and password   not updated", err)
        res.status(500).json({ message: "id and password not updated", err: err.message })
    }
}


const userIdExist = async (req, res) => {
    const { userId } = req.query;
    const isUserId = await Secure_User_Data_Model.findOne({ userID: userId });
    res.json({ exists: !!isUserId });
}
 
 
const UserIdAndPassword = async (req, res) => {
    try {
        const {generateUniqueId, userId, password, confirmPassword } = req.body;
         if(!generateUniqueId) return res.status(404).json({message:"generateUniqueid required in userIdPassword"})
        const isUserId = await Secure_User_Data_Model.findOne({ userID: userId });
        if (isUserId) {
            console.log("UserId is already taken")
            return res.status(400).json({ message: "UserId is already taken" });
        }
        if (password !== confirmPassword) {
            console.log("Confirm Password must matched")
            return res.status(400).json({ message: "Confirm Password must matched" });
        }
        const hashPassword= await bcrypt.hash(password,10)
        const result = await Secure_User_Data_Model.create({
            userID: userId,
            password: hashPassword,
            confirmPassword: hashPassword,
            generateUniqueId: generateUniqueId,
        })
        res.status(200).json({ message: "User id and Password created successfully", result })
        console.log("User id and Password created successfully", result)

    } catch (err) {
        console.log("User id and Password not created", err)
        res.status(500).json({ message: "User id and Password not created", err: err.message })
    }
}

const getNextUserId = async (req, res) => {
    try {
        const lastUser = await UserModel.findOne().sort({ _id: -1 });
        let counter = 1;

        if (lastUser && lastUser.generateUniqueId) {
            const lastCount = parseInt(lastUser.generateUniqueId.slice(1))
            counter = lastCount + 1;
        }
        res.json({ nextUserId: `U${counter}` });
    } catch (err) {
        console.log("Id not generated", err)
        res.status(500).json({ message: "Id not generated", err: err.message })
    }
}
const searchByUserModel = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await UserModel.findOne({ generateUniqueId: id });
        res.status(200).json(result);

    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in usermodel", err: err.message })
    }
}
const searchByPermissionModel = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await PermissionModel.findOne({ generateUniqueId: id });
        res.status(200).json(result);
    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in PermissionModel", err: err.message })
    }
}
const searchByUserIdPasswordModel = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Secure_User_Data_Model.findOne({ generateUniqueId: id });
        res.status(200).json(result);
    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in UserIdPassword", err: err.message })
    }
}
const searchAllUser = async (req, res) => {
    try {
        const result = await UserModel.find().sort({generateUniqueId:1});
        res.status(200).json(result);
    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in UserIdPassword", err: err.message })
    }
}
const searchAllPermission = async (req, res) => {
    try {
        const result = await PermissionModel.find();
        res.status(200).json(result);
    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in UserIdPassword", err: err.message })
    }
}
const searchAllId = async (req, res) => {
    try {
        const result = await Secure_User_Data_Model.find();
        res.status(200).json(result);
    } catch (err) {
        console.log("Search failed ", err)
        res.status(500).json({ message: "search failed in UserIdPassword", err: err.message })
    }
}
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await UserModel.findOneAndDelete({
            generateUniqueId: id
        });
        console.log("User Deleted Successfully");
        res.status(200).json({ message: "User Deleted Successfully", user: result })
    } catch (err) {
        console.log("User Not Delete")
        res.status(500).json({ err: err.message });
    }

}
const deletePermssion = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await PermissionModel.findOneAndDelete({
            generateUniqueId: id
        });
        console.log("Permission Deleted Successfully");
        res.status(200).json({ message: "User Deleted Successfully", user: result })
    } catch (err) {
        console.log("Permission Not Delete")
        res.status(500).json({ err: err.message });
    }

}
const deleteUserIdPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await Secure_User_Data_Model.findOneAndDelete({
            generateUniqueId: id
        });
        console.log("UserID PAsswoRD Deleted Successfully");
        res.status(200).json({ message: "UserID PAsswoRD Deleted Successfully", user: result })
    } catch (err) {
        console.log("UserID PAsswoRD Not Delete")
        res.status(500).json({ err: err.message });
    }

}


const searchUserByNameorMobileorEmail = async (req, res) => {
    try {
        const { query } = req.query;
        console.log("Received search query:", query);
        let searchFilter = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const mobileRegex = /^[0-9]{1,10}$/;

        if (emailRegex.test(query)) {
            searchFilter = { email: { $regex: query, $options: "i" } };
        } else if (mobileRegex.test(query)) {
            searchFilter = { mobile: { $regex: query, $options: "i" } };
        } else {
            searchFilter = { name: { $regex: query, $options: "i" } };

        }
        const result = await UserModel.find(searchFilter);
        console.log("Search by name", result)
        res.status(200).json({ message: "search by name", result })
    } catch (err) {
        console.log("Error to search name", err)
        res.status(500).json({ message: "Erro to search name", err: err.message })
    }
}
module.exports = { updateUserIdAndPassword, searchUserByNameorMobileorEmail, createUser, updateUser, getAllUsers, deleteUser, deletePermssion, deleteUserIdPassword, addPermission, updatePermission, userIdExist, UserIdAndPassword, getNextUserId, searchByUserModel, searchByPermissionModel, searchByUserIdPasswordModel, searchAllUser, searchAllPermission, searchAllId }