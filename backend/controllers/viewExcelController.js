const { viewExcelModel } = require("../models/viewExcelModel")

const getTrackerUserToDumpExcel = async (req, res) => {
    try {
        const result = await viewExcelModel.find().sort({ date_db: 1 })
        res.status(200).json({ message: `excel import by users`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const recordTracker = async (req, res) => {
    try {
        const { recordTracker, userId } = req.body;
        console.log("recordtracker", recordTracker, userId)
        const result = await viewExcelModel.findOneAndUpdate(
            { userId_db: userId },
            {
                $push: {
                    record_tracker_db: recordTracker
                }
            },
            { new: true, upsert: true }
        )
        console.log("data updated successfully", result)
        res.status(200).json({ message: `Data successfully updated by ${userId}. Total Record - ${recordTracker.totalCount_db} MergeId-${recordTracker.mergeId_db} deleted Count - ${recordTracker.deletedCount_db}`, result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal  error", err: err.message })
    }
}

const viewExcelUploadedSheetByUser = async(req,res)=>{
    try{
        const url = req.params.id
        const path = path.join(__dirname,"uploadExcel")
    }catch(err){
        console.log("internal error",err)
        res.status(500).json({message:"internal error",err:err.message})
    }
}

module.exports = { getTrackerUserToDumpExcel, recordTracker }