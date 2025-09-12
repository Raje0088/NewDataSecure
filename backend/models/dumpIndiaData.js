const mongoose = require("mongoose");

const pinCodeSchema = new mongoose.Schema({
    pincode_db:String,
    state_db:String,
    district_db:String,
    taluka_db: String,
    village_db:String,
    country_db:String,
    pincode_db: String,
    latterPincode_id:String,
})

//compound indexing 
pinCodeSchema.index({state_db:1, district_db:1,taluka_db:1,village_db:1})

//index on pincode
pinCodeSchema.index({pincode_db:1});

const pinCodeModel = mongoose.model("pincodeModel",pinCodeSchema)
module.exports = {pinCodeModel};