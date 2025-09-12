const mongoose = require("mongoose");

const taskAssignSchema = new mongoose.Schema({
    date_db: String,
    time_db: String,
    assignBy_db: {
        type: String,
        required: true,
    },
    assignTo_db: {
        type: String,
        required: true,
    },
    filters_db: {
        state_db: { type: String },
        district_db: { type: String },
        business_name_db: { type: String },
    },
    clientIds_db: [{
        client_serial_no_id: String,
        clientId_db: String,
        client_visiting_id: String,
        optical_name_db: { type: Object, required: false, default: {} },
        client_name_db: String,
        address_db: { type: Object, required: false, default: {} },
        district_db: String,
        state_db: String,
        pincode_db: String,
        mobile_1_db: { type: Object, required: false, default: {} },
        email_1_db: { type: Object, required: false, default: {} },
        followup_db: String,
        website_db: String,
        remarks_db: String,
        quotationShare_db: String,
        callType_db: { type: String, default: "Out-bound" },
        expectedDate_db: String,
        verifiedBy_db: String,
        stage_db: String,
        product_db: String,
        country_db: { type: String, default: "INDIA" },
        time_db: String,
        date_db:String,
        isActive_db: { type: Boolean, default: true },
        client_task_status_db: { type: String, default: "pending" },

    }],
    task_status_db: { type: String, default: "pending" },
})

const taskAssignModel = mongoose.model("taskAssignModel", taskAssignSchema)
module.exports = { taskAssignModel };