const mongoose = require("mongoose")
const { rawDataModel } = require("../models/rawDataModel")
const { taskAssignModel } = require("../models/TaskAssignModel")
const { viewExcelModel } = require("../models/viewExcelModel.js")
const { getIO } = require("../socketio/socketInstance")
const { UserModel } = require("../models/user")

//ASSIGN TASK TO EXECUTIVE LIKE EXCEL, REMINDER, BULK DATA
const assignClient = async (req, res) => {
    try {
        const { assignBy, assignTo, productRange, taskType, state, pincode, date, deadline, target, taskMode, district, businessName, mobile, directSend = "false", selectedClients, title = "New Task", excelId, forceAssign } = req.body;
        console.log("task  assign", state, district, excelId, pincode)
        if (directSend === "false" && excelId && excelId.title !== "NA") {
            const alreadyAssign = await taskAssignModel.findOne({ "excelId_db.title": excelId.title })
            if (alreadyAssign && !forceAssign) return res.status(200).json({ askConfirmation: true, message: `Already Assigned to ${alreadyAssign.assignTo_db} by ${alreadyAssign.assignBy_db}` })
        }

        //Updating UserModel of executive to assign Maaster data and also updating viewExcelModel to know excel already assign
        if (excelId?.excelId) {

            const yo = await viewExcelModel.updateOne(
                { dumpBy_db: excelId?.excelId },
                {
                    $set: {
                        assignTo_db: assignTo,
                        assignBy_db: assignBy,
                    }
                },
                {
                    new: true,
                }
            )
            await rawDataModel.updateMany({ dumpBy_db: excelId.excelId },
                {
                    $set: {
                        "master_data_db.assignTo": assignTo,
                    }
                },

            )
            console.log("yo", yo, excelId?.excelId)

            let updateQuery = {
                $set: { "master_data_db.excelId": excelId.excelId },
            }
            updateQuery.$addToSet = {}
            if (district !== "" && district !== "NA") {
                updateQuery.$addToSet["master_data_db.district"] = {
                    name: district,
                    total: selectedClients?.length || 0,
                };
            }
            if (state !== "" && state !== "NA") {
                updateQuery.$addToSet["master_data_db.state"] = state
            }
            if (pincode !== "" && pincode !== "NA") {
                updateQuery.$addToSet["master_data_db.pincode"] = pincode
            }
            await UserModel.updateOne(
                { generateUniqueId: assignTo },
                updateQuery,
                {
                    new: true,
                }
            );
        }

        if (district && state) {
            await rawDataModel.updateMany({ district_db: district, state_db: state },
                {
                    $set: {
                        "master_data_db.assignTo": assignTo,
                    }
                }
            )
        }

        if (pincode.length > 0) {
            await rawDataModel.updateMany({ pincode_db: { $in: pincode } },
                {
                    $set: {
                        "master_data_db.assignTo": assignTo,
                    }
                }
            )
        }

        let clientMap
        if (taskMode === "Regular") {

        } else {
            if (!taskType || !assignBy || !assignTo || selectedClients?.length === 0) return res.status(404).json({ message: "AssignBy , AssignTo, selected Clients and TaskType cannot be empty" })
            if (taskType === "EXCEL") {
                const ids = await rawDataModel.find({ dumpBy_db: selectedClients }, { client_id: 1, _id: 0 })
                clientMap = ids.map((item) => ({ id: item.client_id, status: false }))

            } else {
                clientMap = selectedClients.map((item) => (
                    { id: item, status: false }
                ))
            }
        }

        // console.log("cleitnMap====================================", clientMap)

        let dt = {
            newData: (target.find((item) => item.title === "New data add")?.num) || 0,
            leads: (target.find((item) => item.title === "Leads")?.num) || 0,
            training: (target.find((item) => item.title === "Training")?.num) || 0,
            followUp: (target.find((item) => item.title === "Follow Up")?.num) || 0,
            newCall: (target.find((item) => item.title === "New Call")?.num) || 0,
        };
        console.log("dt", dt)
        const result = await taskAssignModel.create({
            taskType_db: taskMode === "Regular" ? "NA" : taskType,
            task_client_id: clientMap,
            assignBy_db: assignBy,
            assignTo_db: assignTo,
            total_task_db: taskMode === "Regular" ? 0 : clientMap.length,
            pending_db: taskMode === "Regular" ? 0 : clientMap.length,
            task_status_db: "Pending",
            targets_db: dt,
            productPriceRange_db: productRange,
            taskObj_db: target,
            taskMode_db: taskMode,
            uptilDate_db: date,
            deadline_db: deadline,
            excelId_db: excelId,
        })

        const io = getIO();
        const userName = await UserModel.findOne({ generateUniqueId: assignTo })
        const result1 = await taskAssignModel.find({
            task_status_db: "Pending",
            assignTo_db: assignTo,
        })

        io.to(assignTo).emit("assignTask", {
            message: `New task successfully send by ${assignBy} to ${assignTo} (${userName.name})`,
            taskType: taskType,
            sendTo: assignTo,
            sendBy: assignBy,
            title: title,
            totalTask: result1.length,
            result: result1,
            taskId: result._id,
            text: `Title: ${title}, TaskType: ${taskType}, Total Record: ${result1.length}`
        })

        res.status(200).json({
            message: `New task successfully send by ${assignBy} to ${assignTo} (${userName.name})`,
            result,
            taskId: result._id,
            text: `Title: ${title}, TaskType: ${taskType}, Total Record: ${result1.length}`,
            message: `New task successfully send by ${assignBy} to ${assignTo} (${userName.name})`,
        })

    } catch (err) {
        console.log("internal error in assigning", err)
        res.status(500).json({ message: "internal error in assigning", err: err.message })
    }
}


//ACCEPT REJECT REQUEST BY EXECUTIVE 
const assignTaskAcceptRejectRequest = async (req, res) => {
    try {
        const { status, taskId } = req.query;
        const result = await taskAssignModel.findOneAndUpdate({ _id: taskId },
            {
                $set: {
                    request_status_db: status,
                }
            },
            { new: true }
        )
        console.log("task", result)
        res.status(200).json({ message: "Assign Task Request", result }); // only sedning clientIds

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getAssignTaskUserConfiguration = async (req, res) => {
    try {
        const { taskStatus, request, taskType, userId, dateFrom, dateTo } = req.query;

        console.log("userId", userId)
        let filters = {}
        if (taskStatus) filters.task_status_db = taskStatus
        if (request) filters.request_status_db = request
        if (taskType) filters.taskType_db = taskType
        if (userId) filters.assignTo_db = userId
        if (dateFrom || dateTo) {
            filters.createdAt = {}; // if no date pass then fetch all dates
            if (dateFrom) filters.createdAt.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
            if (dateTo) {
                let toDate = new Date(`${dateTo}T00:00:00.000Z`);
                toDate.setDate(toDate.getDate() + 1)
                filters.createdAt.$lt = toDate;
            }
        }

        const result = await taskAssignModel.find(filters)

        if (!result) {
            return res.status(404).json({ message: "No task found for this user." })
        }
        res.status(200).json({ message: "Fetch Assign Task", result }); // only sedning clientIds
    } catch (err) {
        console.error("Error fetching clientIds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

const getExcelDumpClientIdAssignTask = async (req, res) => {
    try {
        const { excelId } = req.query;
        console.log("excelid", excelId)
        const result = await taskAssignModel.find({ dumpBy_db: excelId }, { client_id: 1, _id: 0 }).sort({ client_id: 1 })
        console.log("id", result)
        res.status(200).json({ message: `Excel Data by Id ${excelId}`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getUserAssignTask = async (req, res) => {
    try {

        const userId = req.params.id;
        const { taskStatus, request, taskType, dateFrom, dateTo } = req.query;

        console.log("userId", userId)
        let filters = {}
        if (taskStatus) filters.task_status_db = taskStatus
        if (request) filters.request_status_db = request
        if (taskType) filters.taskType_db = taskType
        if (userId) filters.assignTo_db = userId
        if (dateFrom || dateTo) {
            filters.createdAt = {}; // if no date pass then fetch all dates
            if (dateFrom) filters.createdAt.$gte = new Date(`${dateFrom}T00:00:00.000Z`);
            if (dateTo) {
                let toDate = new Date(`${dateTo}T00:00:00.000Z`);
                toDate.setDate(toDate.getDate() + 1)
                filters.createdAt.$lt = toDate;
            }
        }
        const result = await taskAssignModel.find(filters)

        res.status(200).json({ message: `Assign Task of ${userId}`, result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const cancelAssignTaskBySA = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await taskAssignModel.findOneAndUpdate({ _id: id },
            {
                $set: {
                    task_status_db: "Cancel",
                }
            },
            {
                new: true,
            }
        )
        res.status(200).json({ message: "Assign Task Cancel", result })

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const deleteAssignTaskBySA = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await taskAssignModel.findOneAndDelete({ _id: id })
        res.status(200).json({ message: "Assign Task Deleted Successfully", result })

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//ASSIGNED DETAILS CONTROLLER 


//NOT ASSIGNED DETAILS CONTROLLER
module.exports = { assignClient, assignTaskAcceptRejectRequest, getAssignTaskUserConfiguration, getExcelDumpClientIdAssignTask, getUserAssignTask, cancelAssignTaskBySA, deleteAssignTaskBySA }