const { roleNameModel, divisionModel, assignProductModel } = require("../models/setting");
const mongoose = require("mongoose");

const roleNameField = async (req, res) => {
    const { rolename } = req.body;
    console.log("body", req.body)
    try {
        const result = await roleNameModel.create({
            rolename_name: rolename
        })
        result.save();
        console.log("RoleName added ", result)
        res.status(201).json({ message: "rolename added", result });
    } catch (err) {
        if (err.code) {
            return res.status(400).json({ message: "Duplicate role name not allowed", err: "DUPLICATE_KEY" })
        }
        console.log("Error in roleNameField", err)
        res.status(500).json({ message: "Internal Error in Rolenamefield", err: err.message })
    }
}
const divisionField = async (req, res) => {
    const { division } = req.body;
    try {
        const result = await divisionModel.create({
            division_name: division
        })
        result.save();
        console.log("division added ", result)
        res.status(201).json({ message: "division added", result });
    } catch (err) {
        console.log("Error in divisionField", err)
        res.status(500).json({ message: "Internal Error in divisionfield", err: err.message })
    }
}
const assignProductField = async (req, res) => {
    const { assignProduct, divisionId } = req.body
    try {
        const result = await assignProductModel.create({
            assign_product_name: assignProduct,
            division_Id: divisionId
        })
        result.save();
        console.log("assignProduct added ", result)
        res.status(201).json({ message: "assignProduct added", result });
    } catch (err) {
        console.log("Error in assignProductField", err)
        res.status(500).json({ message: "Internal Error in assignproductfield", err: err.message })
    }
}
// ==========================get===============
const getRoleNameField = async (req, res) => {

    try {
        const result = await roleNameModel.find({});
        console.log("Rolename data", result)
        res.status(200).json({ message: "rolename data", result })

    } catch (err) {
        console.log("rolename not found", err)
        res.status(404).json({ message: "rolename not found", err: err.message })
    }
}
const getAssignProductField = async (req, res) => {

    try {
        const divisionId = req.params.id;
        const result = await assignProductModel.find({
            division_Id: new mongoose.Types.ObjectId(divisionId),
        });
        console.log("division found", result)
        res.status(200).json({ message: "division found", result })
    } catch (err) {
        console.log("assignProduct not found", err)
        res.status(404).json({ message: "assignProduct not found", err: err.message })
    }
}

// ========================== update ===============

const updateRoleNameField = async (req, res) => {
    try {
        const id = req.params.id;
        const { rolename } = req.body;

        const result = await roleNameModel.findByIdAndUpdate(
            id,
            { rolename_name: rolename },
            { new: true }
        );
        console.log("Rolename Updated", result)
        res.status(200).json({ message: "rolename  Updated", result })

    } catch (err) {
        console.log("rolename not update", err)
        res.status(404).json({ message: "rolename not update", err: err.message })
    }
}

// ========================== delete ===============
const deleteRoleNameField = async (req, res) => {
    try {
        const id = req.params.id;

        const result = await roleNameModel.findByIdAndDelete(id);
        console.log("Rolename deleted", result)
        res.status(200).json({ message: "rolename  deleted", result })

    } catch (err) {
        console.log("rolename not delete", err)
        res.status(404).json({ message: "rolename not delete", err: err.message })
    }
}


const getDivisionField = async (req, res) => {
    try {
        const result = await divisionModel.find({});
        console.log("assignProduct data", result)
        res.status(200).json({ message: "assignProduct data", result })

    } catch (err) {
        console.log("divison not found", err)
        res.status(404).json({ message: "division not delete", err: err.message })
    }
}
const updateDivisionField = async (req, res) => {
    try {
        const id = req.params.id;
        const { division } = req.body
        const result = await divisionModel.findByIdAndUpdate(
            id,
            { division_name: division },
            { new: true }
        );
        console.log("division update", result)
        res.status(200).json({ message: "division update", result })

    } catch (err) {
        console.log("divison not update", err)
        res.status(404).json({ message: "division not update", err: err.message })
    }
}
const deleteDivisionField = async (req, res) => {
    try {
        const id = req.params.id;

        const resultD = await divisionModel.findByIdAndDelete(id);
        const resultA = await assignProductModel.deleteMany({ division_Id: id });
        console.log("Rolename deleted", resultD)
        console.log("Rolename deleted", resultA)
        res.status(200).json({
            message: "Division and related assign products deleted",
            division: resultD,
            deletedAssignProducts: resultA.deletedCount,
        })

    } catch (err) {
        console.log("division not delete", err)
        res.status(404).json({ message: "division not delete", err: err.message })
    }
}
const updateAssignProductField = async (req, res) => {
    try {
        const id = req.params.id;
        const { assignproduct } = req.body
        const result = await assignProductModel.findByIdAndUpdate(
            id,
            { assign_product_name: assignproduct },
            { new: true }
        );
        console.log("assignproduct update", result)
        res.status(200).json({ message: "assignproduct update", result })

    } catch (err) {
        console.log("assignproduct not update", err)
        res.status(404).json({ message: "assignproduct not update", err: err.message })
    }
}
const deleteAssignProductField = async (req, res) => {
    try {
        const id = req.params.id;

        const result = await assignProductModel.findByIdAndDelete(id);
        console.log("assignproduct deleted", result)
        res.status(200).json({ message: "assign products deleted", result })

    } catch (err) {
        console.log("assignproduct not delete", err)
        res.status(404).json({ message: "assignproduct not delete", err: err.message })
    }
}

const getSuperAdminAllProduct = async (req, res) => {
    try {
        const result = await assignProductModel.find({}, { assign_product_name: 1,_id:0 })
        console.log("assignproduct SA", result)
        res.status(200).json({ message: "assign products deleted", result })
    } catch (err) {
        console.log("assignproduct not delete", err)
        res.status(404).json({ message: "assignproduct not delete", err: err.message })
    }
}


module.exports = { roleNameField, updateAssignProductField, deleteAssignProductField, divisionField, assignProductField, getRoleNameField, updateRoleNameField, deleteRoleNameField, deleteDivisionField, updateDivisionField, getDivisionField, getAssignProductField, getSuperAdminAllProduct};