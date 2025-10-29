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
    excelId_db: { title: String, excelId: String },
    assignById_db: { type: String },
    assignToId_db: { type: String },
},{timestamps:true})

const userFormModel = mongoose.model("userFormModel", userFormSchema);
module.exports = { userFormModel };
