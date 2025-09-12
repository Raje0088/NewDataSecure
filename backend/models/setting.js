const mongoose = require("mongoose")

const rolenameSchema = new mongoose.Schema({
    rolename_name: {
        type:String,
        unique:true,
    }
})
const divisionSchema = new mongoose.Schema({
    division_name: String,
})
const assignProductSchema = new mongoose.Schema({
    assign_product_name: String,
    division_Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "divisionModel",
        required: true,
    },
})
const roleNameModel = mongoose.model("roleNameModel", rolenameSchema)
const divisionModel = mongoose.model("divisionModel", divisionSchema)
const assignProductModel = mongoose.model("assignProductModel", assignProductSchema);

module.exports = { roleNameModel, divisionModel, assignProductModel }