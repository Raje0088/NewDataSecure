const mongoose = require("mongoose");

const userFormSchema = new mongoose.Schema({
    assign_task: [{
        title: String,
        num: Number,
        completed: { type: Number, default: 0 }, // Completed count
    }],
    request_task: [{
        title: String,
        num: Number,
        text: String,
        completed: { type: Number, default: 0 },
    }],
    product_task: [{
        title: String,
        min: Number,
        max: Number,
    }],
    assignById_db: { type: String },
    assignToId_db: { type: String },
    date_db: String,
    time_db: String,
    deadline_db: String,
    cron_deadline_db: String,
    isLocked_db: { type: Boolean, default: false },
    goal_status_db: { type: String, default: "active" },

})
const userFormModel = mongoose.model("userFormModel", userFormSchema);
module.exports = { userFormModel };
