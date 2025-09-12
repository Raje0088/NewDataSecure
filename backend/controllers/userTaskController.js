const { userFormModel } = require("../models/userForm.js");
const { clientModel } = require("../models/clientModel.js")
const { getIO } = require("../socketio/socketInstance")
const { clientHistoryModel } = require("../models/historyModel.js")
const cron = require("node-cron");


const saveUserForm = async (req, res) => {
    try {
        const { assignTask, requestTask, productTask, assignToId, assignById, deadline } = req.body;
        console.log("Deadline", deadline);
        console.log("assigntask", assignTask, requestTask)

        const assignTasks = assignTask.map(t => ({
            title: t.title.toLowerCase(),
            num: t.num,
            completed: t.completed
        }));
        const requestTasks = requestTask.map(t => ({
            title: t.title.toLowerCase(),
            num: t.num,
            text: t.text,
            completed: t.completed
        }));


        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        const todayDate = `${yyyy}-${mm}-${dd}`;

        let deadlineTime = deadline || "23:59:00";

        // Smart cleanup and handling
        if (deadline && (deadline.toLowerCase().includes("am") || deadline.toLowerCase().includes("pm"))) {

            // Remove extra spaces, ensure proper split
            const parts = deadline.trim().split(/\s+/); // Splits by one or more spaces
            const time = parts[0];
            const modifier = parts[1]?.toLowerCase(); // safe check for AM/PM

            if (time && modifier) {
                let [hours, minutes, seconds] = time.split(":").map(Number);
                if (modifier === "pm" && hours < 12) hours += 12;
                if (modifier === "am" && hours === 12) hours = 0;

                deadlineTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
        }

        const finalDateString = `${todayDate}T${deadlineTime}`;
        const fullDeadline = new Date(finalDateString);

        console.log("✅ finalDateString:", finalDateString);
        console.log("✅ fullDeadline:", fullDeadline);

        const result = await userFormModel.create({
            assign_task: assignTasks,
            request_task: requestTasks,
            product_task: productTask,
            assignById_db: assignById,
            assignToId_db: assignToId,
            date_db: new Date().toLocaleDateString('en-GB'),
            time_db: new Date().toLocaleTimeString(),
            deadline_db: fullDeadline.toLocaleTimeString(),
            cron_deadline_db: fullDeadline,
        })
        console.log("🕐 fullDeadline", fullDeadline.toString());
        console.log("🕐 Date now", new Date().toString());

        // result.save();
        const io = getIO();
        io.to(assignToId).emit("extra-task-assigned", {
            message: `${assignById} assigned you new task`,
            newTask: result
        })


        console.log("Form saved sucessfully", result)
        res.status(201).json({ message: "Form saved sucessfully", newTask: result })

    } catch (err) {
        console.log("Form not saved", err)
        res.status(500).json({ message: "Form not saved", err: err.message })
    }
}

const updateUserForm = async (req, res) => {
    try {
        const id = req.params.id;
        const { assignTask, requestTask, productTask, assignById } = req.body;
        const result = await userFormModel.findOneAndUpdate(
            {
                assignToId_db: id,
                assignById_db: assignById,
                date_db: new Date().toLocaleDateString()
            },
            {
                "$set": {
                    assign_task: assignTask,
                    request_task: requestTask,
                    product_task: productTask,
                    date_db: new Date().toLocaleDateString(),
                    time_db: new Date().toLocaleTimeString(),

                }
            },
            { new: true },
        )

        // result.save();
        const io = getIO();
        io.to(id).emit("extra-task-assigned", {
            message: `${assignById} assigned you new task`,
            newTask: result
        })

        console.log("Form updated sucessfully", result)
        res.status(200).json({ message: "Form update sucessfully", newTask: result })

    } catch (err) {
        console.log("Form not update", err)
        res.status(500).json({ message: "Form not update", err: err.message })
    }
}

const deleteUserForm = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await userFormModel.findOneAndDelete({
            generateUniqueId: id
        });
        console.log("UserID PAsswoRD Deleted Successfully");
        res.status(200).json({ message: "UserID PAsswoRD Deleted Successfully", user: result })
    } catch (err) {
        console.log("UserID PAsswoRD Not Delete")
        res.status(500).json({ err: err.message });
    }

}
const searchUserFormId = async (req, res) => {
    try {
        const generateUniqueId = req.params.id;
        console.log("generateUniqueId", generateUniqueId)
        const result = await userFormModel.findOne({
            assignToId_db: generateUniqueId,
            date_db: new Date().toLocaleDateString("en-GB"),
        }).sort({ time_db: -1 })
        console.log("result", result)
        res.status(200).json({ message: "User id  found", result });

    } catch (err) {
        console.log("User id Not found")
        res.status(500).json({ message: "User id Not found", err: err.message });
    }
}

cron.schedule('* * * * *', async () => {
    const now = new Date();
    const result = await userFormModel.updateMany({
        isLocked_db: false,
        cron_deadline_db: { $lt: now },
    },
        { $set: { isLocked_db: true } }
    )
    if (result.modifiedCount > 0) {
        console.log(`✅ Cron: Locked ${result.modifiedCount} expired schedules.`);

    }
})

const getTotalCountDetailsForUserForm = async (req, res) => {
    try {
        const { userId } = req.params;
        const todayDate = new Date().toLocaleDateString('en-GB')

        const stages = ["no of new calls", "demo", "installation", "target",
            "recovery", "support", "follow up"]

        const formData = await userFormModel.findOne({
            assignToId_db: userId,
            date_db: todayDate,
        })

        if (!formData) {
            return res.status(404).json({ message: "User form not found" })
        }

        const results = {}

        for (let stage of stages) {
            const totalCounts = await clientModel.countDocuments({
                assignTo: userId,
                date_db: todayDate,
                stage_db: stage,
            })

            results[stage] = totalCounts;
            const assignTask = formData.assign_task.find(t => t.title.toLowerCase() === stage.toLowerCase())
            const requestTask = formData.request_task.find(t => t.title.toLowerCase() === stage.toLowerCase())

            if (assignTask) {
                const updateAssign = await userFormModel.updateOne(
                    { _id: formData._id, "assign_task.title": stage },
                    { $set: { "assign_task.$.completed": totalCounts } }
                )
                console.log("Assign Task Update:", updateAssign);

            }

            if (requestTask) {
                await userFormModel.updateOne(
                    { _id: formData._id, "request_task.title": stage },
                    { $set: { "request_task.$.completed": totalCounts } }
                )

            }
        }
        return res.json({
            success: true,
            counts: results,  // Only show done count to frontend
        });
    } catch (err) {
        console.log("User id Not found")
        res.status(500).json({ message: "User id Not found", err: err.message });
    }
}

cron.schedule("* * * * *", async () => {
    try {
        const taskTypes = {
            "demo_db": "demo_completed_db",
            "installation_db": "installation_completed_db",
            "support_db": "support_completed_db",
            "recovery_db": "recovery_completed_db",
            "no_of_new_calls_db": "no_of_new_calls_completed_db",
            "follow_up_db": "followup_completed_db",
        }
        const today = new Date().toLocaleDateString("en-GB")
        for (const [taskType, taskField] of Object.entries(taskTypes)) {
            const completeField = `tracking_db.${taskType}.completed`;
            const completeDateField = `tracking_db.${taskType}.completedDate`
            const aggregationResult = await clientHistoryModel.aggregate([
                {
                    $match: {
                        [completeField]: true,
                        [completeDateField]: today,
                    }
                },
                {
                    $unwind:"$product_db"
                },
                {
                    $group:{
                        _id:{
                            userId:"$assignTo",
                            product:"$product_db.value"
                        },
                        count:{$sum:1}
                    }
                }
            ])
            console.log("aggragateResult",aggregationResult)
        }


    } catch (err) {
        console.log("internal error", err)
    }
})

module.exports = { saveUserForm, updateUserForm, deleteUserForm, searchUserFormId, getTotalCountDetailsForUserForm } 