const mongoose = require("mongoose");

const taskAssignSchema = new mongoose.Schema({
    taskMode_db:{type:String, enum:["Bulk","Request","Regular"],},
    taskType_db:String,
    assignBy_db: {
        type: String,
    },
    assignTo_db: {
        type: String,
        required: true,
    },
    task_client_id:{type:Array},
    total_task_db:Number,
    excelId_db: {
        title:String,
        excelId:String,
    },
    completed_db:{type:Number,default:0},
    pending_db:Number,
    task_status_db: { type: String, enum: ["Pending", "Active", "Completed", "Expired"], default: "Pending" },
    request_status_db:{type:String, default:"Pending"},
    targets_db:{
        demo:{type:Number, default:0},
        newData:{type:Number, default:0},
        leads:{type:Number, default:0},
        followUp:{type:Number, default:0},
        training:{type:Number, default:0},
        newCall:{type:Number,default:0},
    },
    progress_db:{
        demo:{type:Number, default:0},
        leads:{type:Number, default:0},
        followUp:{type:Number, default:0},
        training:{type:Number, default:0},
        newCall:{type:Number,default:0},
    },
    uptilDate_db:String,
    time_db:String,
    deadline_db:String,
    productPriceRange_db:{type:Array},
    taskObj_db:{type:Array},
}, { timestamps: true })

const taskAssignModel = mongoose.model("taskAssignModel", taskAssignSchema)
module.exports = { taskAssignModel };   