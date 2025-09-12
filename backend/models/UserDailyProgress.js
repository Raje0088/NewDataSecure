const mongoose = require("mongoose")

const DailySchema = new mongoose.Schema({
    userId_db: String,
    date_db: String,

    daily_installation_assigned_db: { type: Number, default: 0 },
    daily_installation_completed_db: { type: Number, default: 0 },

    daily_demo_assigned_db: { type: Number, default: 0 },
    daily_demo_completed_db: { type: Number, default: 0 },

    daily_recovery_assigned_db: { type: Number, default: 0 },
    daily_recovery_completed_db: { type: Number, default: 0 },

    daily_support_assigned_db: { type: Number, default: 0 },
    daily_support_completed_db: { type: Number, default: 0 },

    daily_target_assigned_db: { type: Number, default: 0 },
    daily_target_completed_db: { type: Number, default: 0 },

    daily_no_of_new_calls_assigned_db: { type: Number, default: 0 },
    daily_no_of_new_calls_completed_db: { type: Number, default: 0 },

    daily_followup_assigned_db: { type: Number, default: 0 },
    daily_followup_completed_db: { type: Number, default: 0 },
},{timestamps:true})

const WeeklySchema = new mongoose.Schema({
    userId_db: String,
    date_db: String,

    weekly_installation_assigned_db: { type: Number, default: 0 },
    weekly_installation_completed_db: { type: Number, default: 0 },

    weekly_demo_assigned_db: { type: Number, default: 0 },
    weekly_demo_completed_db: { type: Number, default: 0 },

    weekly_recovery_assigned_db: { type: Number, default: 0 },
    weekly_recovery_completed_db: { type: Number, default: 0 },

    weekly_support_assigned_db: { type: Number, default: 0 },
    weekly_support_completed_db: { type: Number, default: 0 },

    weekly_target_assigned_db: { type: Number, default: 0 },
    weekly_target_completed_db: { type: Number, default: 0 },

    weekly_no_of_new_calls_assigned_db: { type: Number, default: 0 },
    weekly_no_of_new_calls_completed_db: { type: Number, default: 0 },

    weekly_followup_assigned_db: { type: Number, default: 0 },
    weekly_followup_completed_db: { type: Number, default: 0 },
},{timestamps:true})

const MonthlySchema = new mongoose.Schema({
    userId_db: String,
    date_db: String,

    monthly_installation_assigned_db: { type: Number, default: 0 },
    monthly_installation_completed_db: { type: Number, default: 0 },

    monthly_demo_assigned_db: { type: Number, default: 0 },
    monthly_demo_completed_db: { type: Number, default: 0 },

    monthly_recovery_assigned_db: { type: Number, default: 0 },
    monthly_recovery_completed_db: { type: Number, default: 0 },

    monthly_support_assigned_db: { type: Number, default: 0 },
    monthly_support_completed_db: { type: Number, default: 0 },

    monthly_target_assigned_db: { type: Number, default: 0 },
    monthly_target_completed_db: { type: Number, default: 0 },

    monthly_no_of_new_calls_assigned_db: { type: Number, default: 0 },
    monthly_no_of_new_calls_completed_db: { type: Number, default: 0 },

    monthly_followup_assigned_db: { type: Number, default: 0 },
    monthly_followup_completed_db: { type: Number, default: 0 },
},{timestamps:true})


const userGraphSchema = new mongoose.Schema({
    userId_db:String,
    date_db:{type:Array},
    ideal_db:{type:Array, default:0},
    actual_db:{type:Array, default:0},
},{timestamps:true})

const userDailyProgress = mongoose.model("userdailyprogress",DailySchema)
const  userWeeklyProgress = mongoose.model("userweeklyprogress",WeeklySchema)
const  userMonthlyProgress = mongoose.model("usermonthlyprogress",MonthlySchema)
const  userGraphModel = mongoose.model("usergraphmodel",userGraphSchema)

module.exports = {userDailyProgress,userWeeklyProgress,userMonthlyProgress,userGraphModel}