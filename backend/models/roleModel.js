const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema({
    name:{
        type:String,
        enum:['superadmin','admin','executive','manager'],
        required:true,
        unique:true,
    }
})
const roleModel = mongoose.model("roleModel",roleSchema);
module.exports = {roleModel}