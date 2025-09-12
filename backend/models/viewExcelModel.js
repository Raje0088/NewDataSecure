const mongoose = require("mongoose")

const recordSchema = new mongoose.Schema({
    totalCount_db: Number,
    mergeCount_db: Number,
    mergeId_db: String,
    deleteId_db: [String],
    deletedCount_db:Number,
    createdAt: { type: Date, default: Date.now },
})

const viewExcelSchema = new mongoose.Schema({
    userId_db: String,
    excelURL_db: String,
    date_db: String,
    time_db: String,
    total_db: Number,
    dumpBy_db: String,
    record_tracker_db: [recordSchema],
}, { timestamps: true })

const viewExcelModel = mongoose.model("viewExcelmodel", viewExcelSchema)

module.exports = { viewExcelModel }