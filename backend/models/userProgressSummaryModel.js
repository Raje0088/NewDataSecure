const mongoose = require("mongoose")

const userProgressSummarySchema = new mongoose.Schema({
    userId_db: String,
    date_db: String,
    product_db:String,

    installation_assigned_db:{type:Number,default:0},
    installation_completed_db:{type:Number,default:0},

    demo_assigned_db:{type:Number,default:0},
    demo_completed_db:{type:Number,default:0},

    recovery_assigned_db:{type:Number,default:0},
    recovery_completed_db:{type:Number,default:0},

    support_assigned_db:{type:Number,default:0},
    support_completed_db:{type:Number,default:0},

    target_assigned_db:{type:Number,default:0},
    target_completed_db:{type:Number,default:0},

    no_of_new_calls_assigned_db:{type:Number,default:0},
    no_of_new_calls_completed_db:{type:Number,default:0},

    followup_assigned_db:{type:Number,default:0},
    followup_completed_db:{type:Number,default:0},


}, { timestamps: true })

const userProgressSummaryModel = mongoose.model("userProgressSummaryModel",userProgressSummarySchema)

module.exports = {userProgressSummaryModel}