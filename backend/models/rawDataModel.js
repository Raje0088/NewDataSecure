const mongoose = require("mongoose")

const rawDataSchema = new mongoose.Schema({
    client_serial_no_id: { type: Number, required: true },
    isActive_db: { type: Boolean, default: true },
    client_id: String,
    optical_name1_db: String,
    optical_name2_db: String,
    optical_name3_db: String,
    client_name_db: String,
    address_1_db: String,
    address_2_db: String,
    address_3_db: String,
    district_db: String,
    state_db: String,
    country_db:String,
    pincode_db: String,
    mobile_1_db: String,
    mobile_2_db: String,
    mobile_3_db: String,
    email_1_db: String,
    email_2_db: String,
    email_3_db: String,
    followup_db: String,
    isSkip_db:{type:String, default:false},
    database_status_db: {
        type: String,
        enum: ["client_db", "raw_db", "user_db"],
        default: "raw_db",
    },
    dumpBy_db:String,
})

const rawDataModel = mongoose.model("rawDataModel", rawDataSchema);
module.exports = { rawDataModel }