const { clientHistoryModel } = require("../models/historyModel")
const { remainderModel } = require("../models/remainderModel")
const cron = require("node-cron")
const { getIO } = require("../socketio/socketInstance")


const startRemainder = () => {
    cron.schedule("* * * * *", async () => {
        try {
            const date = new Date().toISOString().split("T")[0]
            console.log("date", new Date().toLocaleDateString("en-GB"))
            const stages = [
                { db: "follow_up_db", label: "FollowUp" },
                { db: "hot_db", label: "Hot" },
                { db: "installation_db", label: "Installation" },
                { db: "demo_db", label: "Demo" },
                { db: "training_db", label: "Training" },
                { db: "support_db", label: "Support" },
                { db: "recovery_db", label: "Recovery" },
            ];



            for (const stage of stages) {
                const docs = await clientHistoryModel.find({ expectedDate_db: { $gte: date }, "stage_db.value": stage.db, })
                await Promise.all(docs.map((doc) => (
                    remainderModel.findOneAndUpdate(
                        { client_id: doc.client_id, stage_db: stage.label, date_db: doc.expectedDate_db },
                        {
                            $set: {
                                client_id: doc.client_id,
                                client_name_db: doc.client_name_db,
                                stage_db: stage.label,
                                date_db: doc.expectedDate_db,
                                time_db: doc.time_db,
                                operation_db: "Schedule",
                                database_db: doc.database_status_db,
                                status_db: false,
                            }
                        },
                        {
                            new: true, upsert: true,
                        }
                    )
                )))
            }

            for (const stage of stages) {
                const docs = await clientHistoryModel.find({ "completion_db.newExpectedDate": { $gte: date }, "completion_db.status": "Postponed", "completion_db.newStage": stage.label })
                await Promise.all(docs.map((doc) => (
                    remainderModel.findOneAndUpdate(
                        { client_id: doc.client_id, stage_db: stage.label },
                        {
                            $set: {
                                client_id: doc.client_id,
                                client_name_db: doc.client_name_db,
                                stage_db: stage.label,
                                operation_db: "Reschedule",
                                time_db: doc.completion_db.newTime,
                                date_db: doc.completion_db.newExpectedDate,
                                database_db: doc.database_status_db,
                                status_db: false,
                            }
                        },
                        {
                            new: true, upsert: true,
                        })
                )))
            }

            const results = await clientHistoryModel.find({ "completion_db.status": "Done" ,date_db:date})

            console.log(" client history found", results.length, date);
            if (!results) {
                console.log("No matching client history found");
                return;
            }
            for (const result of results) {
                await remainderModel.findOneAndUpdate(
                    {
                        client_id: result.client_id,
                        stage_db: result.completion_db.newStage,
                    },
                    {
                        $set: {
                            status_db: true,
                        }
                    },
                    {
                        new: true,
                    })
            }

            const remainders = await remainderModel.find({ date_db: date }).sort({ time_db: 1 })
            const io = getIO()
            io.emit("remainder", remainders)
            // console.log("result", remainders)
        } catch (err) {
            console.log("internal error", err)
        }
    })
}
const getRemainders = async (req, res) => {
    try {
        const date = new Date().toISOString().split("T")[0]
        const result = await remainderModel.find({ date_db: date }).sort({ time_db: 1 })

        res.status(200).json({ message: "remainders", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getCompleteRemainer = async (req, res) => {
    try {
        const date = req.params.id;
        console.log("id", date)
        const result = await remainderModel.find({ date_db: date })
        res.status(200).json({ message: "status", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { startRemainder, getRemainders, getCompleteRemainer };