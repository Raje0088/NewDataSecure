const mongoose = require("mongoose")
const { rawDataModel } = require("../models/rawDataModel")
const { taskAssignModel } = require("../models/TaskAssignModel")
const { getIO } = require("../socketio/socketInstance")


const assignClient = async (req, res) => {
    try {
        const { state, district, businessName, mobile } = req.query;
        const { assignBy, assignTo } = req.body;
        console.log("req.query", req.query)
        console.log("req.body", req.body)

        //fetch matching clients from rawDataModel
        const filters = {};
        if (state) filters.state_db = new RegExp(state, "i");
        if (district) filters.district_db = new RegExp(district, "i");
        if (businessName) filters.optical_name1_db = new RegExp(businessName, "i");
        if (mobile) filters.mobile_1_db = mobile;

        const result = await rawDataModel.find(filters)
        console.log("result", result)
        // console.log("Type of result:", typeof result);
        // console.log("Is Array:", Array.isArray(result));
        if (result.length === 0) {
            return res.status(404).json({ message: "No matching raw data found" })
        }

        // Extract all _ids of those rawDataModel entries
        const clientIds = result.map((entry) => ({
            id: entry._id,
            clientId_db: entry.client_id,
            client_serial_no_id: entry.client_serial_no_id,
            client_visiting_id:"",
            optical_name_db:  entry.optical_name1_db,
            client_name_db: entry.client_name_db,
            address_db: entry.address_1_db,
            district_db: entry.district_db,
            state_db: entry.state_db,
            pincode_db: entry.pincode_db,
            mobile_1_db: entry.mobile_1_db,
            email_1_db: entry.email_1_db,
            followup_db: entry.followup_db,
            website_db: entry.website_db || "",
            remarks_db:  entry.remarks_db || "",
            quotationShare_db:  entry.quotationShare_db || "",
            callType_db: entry.callType_db || "",
            expectedDate_db: entry.expectedDate_db || "",
            verifiedBy_db: entry.verifiedBy_db || "",
            stage_db: entry.stage_db || "",
            product_db: entry.product_db || "",
            country_db:entry.country_db || "",
            time_db: entry.time_db || "",
            date_db: entry.date_db || "",
            isActive_db: "true",
        }));
        console.log("clients", clientIds)
        // Get date and time
        const now = new Date();
        const date_db = now.toISOString().split("T")[0]
        const time_db = now.toLocaleTimeString();
        // console.log("time show",time_db)
        //save task asignment entry
        const taskEntry = await taskAssignModel.create({
            date_db: date_db,
            time_db: time_db,
            assignBy_db: assignBy, 
            assignTo_db: assignTo,
            filters_db: {
                state_db: state,
                district_db: district,
                business_name_db: businessName,
            },
            clientIds_db: clientIds,
        })
        const taskCount = await taskAssignModel.countDocuments({
            assignTo_db: assignTo,
            task_status_db: "pending",
        })

        // console.log("taskcount-------------",taskCount)
        const io = getIO()
        const executiveId = assignTo
        io.to(executiveId).emit("taskAssigned", {
            message: "New task assigned to you!",
            count: taskCount,
            Newtask: taskEntry,
        })
        console.log("✅ taskAssigned emitted to:", executiveId);

        res.status(200).json({
            message: "Clients assigned successfully",
            assignedClientCounts: clientIds.length,
            task: taskEntry, 
        })

    } catch (err) {
        console.log("internal error in assigning", err)
        res.status(500).json({ message: "internal error in assigning", err: err.message })
    }
}

const getAssignByAssignTo = async (req, res) => {
    try {
        const { userId} = req.params;
        const {taskStatus } = req.query;

        const query = {assignTo_db: userId}
        if(taskStatus && taskStatus !=="all"){
            query.task_status_db=taskStatus;
        }

        //find the task assinged to this excetive
        const tasks = await taskAssignModel.find(query).sort({ date_db: 1, time_db: 1 })
        if (!tasks) {
            return res.status(404).json({ message: "No task found for this user." })
        }
        console.log("task bolte", tasks)
        const formatTask = {};
        tasks.forEach((task, index) => {
            formatTask[`task${index + 1}`] = task;
        })
        res.status(200).json({
            count: tasks.length,
            tasks: formatTask
        }); // only sedning clientIds
    } catch (err) {
        console.error("Error fetching clientIds:", err);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = { assignClient, getAssignByAssignTo }