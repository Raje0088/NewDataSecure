
const { clientHistoryModel } = require("../models/historyModel")
const { clientModel } = require("../models/clientModel")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")
const { getNextGobalCounterSequence } = require("../utils/getNextSequence")
const { userProgressSummaryModel } = require("../models/userProgressSummaryModel")
const { scheduleOptimaModel } = require("../models/ScheduleOptima")

const createHistory = async (req, res) => {
    try {
        // console.log("req body", req.body)
        const { clientSerialNo, clientId, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label, completion,
            followUpDate, verifiedBy, action, followUpTime, database, tracker, amountDetails, amountHistory, isUserPage = false } = req.body;
        // console.log("tracker in history", tracker);
        // console.log("product ->", product);
        // console.log("---------------=========================-------------====>", product)

        // console.log("===========================  History label ===========================================",label)
        const bussiness1 = bussinessNames[0]?.value || "";
        const bussiness2 = bussinessNames[1]?.value || "";
        const bussiness3 = bussinessNames[2]?.value || "";

        const email1 = emails[0]?.value || ""
        const email2 = emails[1]?.value || ""
        const email3 = emails[2]?.value || ""

        const mobile1 = numbers[0]?.value || ""
        const mobile2 = numbers[1]?.value || ""
        const mobile3 = numbers[2]?.value || ""

        const address1 = addresses[0]?.value || ""
        const address2 = addresses[1]?.value || ""
        const address3 = addresses[2]?.value || ""


        let subscriptionId = ""
        let isFirstTimeInstallation = false;
        if (!isUserPage) {
            const oldClient = await clientModel.findOne({ client_id: clientId });
            // console.log("old client", oldClient, clientId)
            const previouslyInstalled = oldClient.tracking_db?.installation_db?.completed;
            const newInstallationCompleted = tracker?.installation_db?.completed;
            isFirstTimeInstallation = !previouslyInstalled && newInstallationCompleted;

            subscriptionId = isFirstTimeInstallation ? clientId.replace("C", "U") : "";
        }
        if (isUserPage) {
            const oldUser = await clientSubscriptionModel.findOne({ client_id: clientId });

            if (!oldUser) {
                console.log("Warning: User not found for clientId", clientId);
            }

            const previouslyInstalled = oldUser?.tracking_db?.installation_db?.completed;
            const newInstallationCompleted = tracker?.installation_db?.completed;

            const isFirstTimeInstallation = !previouslyInstalled && newInstallationCompleted;
            subscriptionId = isFirstTimeInstallation ? clientId.replace("C", "U") : "";
        }




        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }
        const updatedTracker = {
            ...tracker,
            recovery_db: {
                ...tracker?.recovery_db,
                recoveryHistory: tracker?.recovery_db?.recoveryHistory || [],
            }
        }
        const updatedAmountHistory = [
            ...(amountHistory || []),
            {
                date: new Date().toLocaleDateString("en-GB"),
                time: new Date().toLocaleTimeString(),
                totalAmount: amountDetails.totalAmount || "",
                paidAmount: amountDetails.paidAmount || "",
                extraCharges: amountDetails.extraCharges || "",
                finalCost: amountDetails.finalCost || "",
                newAmount: amountDetails.newAmount || "",
                balanceAmount: amountDetails.balanceAmount || "",
                updatedBy: userId,
            }
        ]

        const visitingId = await getNextGobalCounterSequence(`clientVisited_${clientId}`)
        const result = await clientHistoryModel.create({
            client_serial_no_id: clientSerialNo,
            client_id: clientId,
            userId_db: userId,
            client_visiting_id: visitingId,
            client_History_id: `H${clientId}_${visitingId}`,
            client_subscription_id: subscriptionId,

            optical_name1_db: bussiness1,
            optical_name2_db: bussiness2,
            optical_name3_db: bussiness3,

            client_name_db: clientName,

            address_1_db: address1,
            address_2_db: address2,
            address_3_db: address3,

            district_db: district,
            state_db: state,
            pincode_db: pincode,

            mobile_1_db: mobile1,
            mobile_2_db: mobile2,
            mobile_3_db: mobile3,

            email_1_db: email1,
            email_2_db: email2,
            email_3_db: email3,

            followup_db: followUpDate,
            website_db: website,
            remarks_db: remarks,
            quotationShare_db: quotationShare,
            callType_db: callType,
            expectedDate_db: expectedDate,
            verifiedBy_db: verifiedBy,
            assignBy: assignBy,
            assignTo: assignTo,
            stage_db: stage,
            product_db: product,
            country_db: country,
            time_db: followUpTime,
            date_db: new Date().toISOString().split("T")[0],
            action_db: action,
            database_status_db: database,
            tracking_db: updatedTracker,
            label_db: label,
            completion_db: completion,
            amountDetails_db: amountDetails,
            amountHistory_db: updatedAmountHistory,
            isSubscriber_db: isFirstTimeInstallation ? true : false,
        })
        // console.log("Client History save Successfully", result)
        res.status(201).json({ message: "Client History save Successfully", result })

        yo(result)
        goalSchedule(result)

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error in create client", err: err.message })
    }
}

const yo = async (result) => {
    try {

        const PROGRESS_MAPPING = {
            demo_db: "demo_db",
            new_data_db: "new_data_db",
            recovery_db: "recovery_db",
            training_db: "training_db",
            follow_up_db: "followUp_db",
            installation_db: "installation_db",
            support_db: "support_db",
            target_db: "target_db",
            leads_db: "lead_db",
            no_of_new_calls_db: "new_calls_db"
        };

        const userId = result.userId_db
        const date = result.date_db
        const productArray = result.product_db.map((item) => (item.label)) || []
        const tracking = result.tracking_db

        for (const prod of productArray) {
            for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
                const trackingField = tracking[key]
                if (trackingField && trackingField.completed === true) {
                    const updateQuery = { $inc: {} };

                    updateQuery.$inc[`${mappedKey}.completed`] = 1

                    await userProgressSummaryModel.updateOne({ userId_db: userId, date_db: date, product_db: prod },
                        updateQuery,
                        { upsert: true }
                    )
                    console.log(`✅ Progress updated for ${userId} → ${mappedKey} (${prod})`);
                }
            }
        }
    } catch (err) {
        console.log("internal error in userProgress function", err)
    }

}
const goalSchedule = async (result) => {
    try {

        const PROGRESS_MAPPING = {
            demo_db: "demo_db",
            new_data_db: "new_data_db",
            recovery_db: "recovery_db",
            training_db: "training_db",
            follow_up_db: "followUp_db",
            installation_db: "installation_db",
            support_db: "support_db",
            target_db: "target_db",
            leads_db: "lead_db",
            no_of_new_calls_db: "new_calls_db"
        };

        const userId = result.userId_db
        const date = result.date_db
        const productArray = result.product_db.map((item) => (item.label)) || []
        const tracking = result.tracking_db
 
        for (const prod of productArray) {
            for (const [key, mappedKey] of Object.entries(PROGRESS_MAPPING)) {
                const trackingField = tracking[key]
                if (trackingField && trackingField.completed === true) {
                    const updateQuery = { $inc: {} };

                    updateQuery.$inc[`goals_db.${prod}.${mappedKey}.completed_db`] = 1
                    console.log("updatequery",updateQuery)
                    await scheduleOptimaModel.updateOne({ userId_db: userId, date_todo_db: date },
                        updateQuery,
                        { upsert: true }
                    )
                    console.log(`✅ Progress updated for ${userId} → ${mappedKey} (${prod})`);
                }
            }
        }
    } catch (err) {
        console.log("internal error in userProgress function", err)
    }

}




const getHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log("Searching History for clientId:", clientId);
        const history = await clientHistoryModel.find({ client_id: clientId }).sort({ client_visiting_id: 1 })
        const totalCount = await clientHistoryModel.countDocuments({ client_id: clientId })
        console.log("client History Found", history)
        res.status(200).json({ message: "client History Found", totalRecords: totalCount, result: history })
    } catch (err) {
        console.log("internal err", err)
        res.status(500).json({ message: "internal error in history", err: err.message })
    }
}

const getLastUpdatedClientHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        console.log("Searching History for clientId:", clientId);
        const history = await clientHistoryModel.findOne({ client_id: clientId }).sort({ client_visiting_id: -1 })
        console.log("client History Found", history)
        res.status(200).json({ message: "client History Found", result: history })
    } catch (err) {
        console.log("internal err", err)
        res.status(500).json({ message: "internal error in history", err: err.message })
    }
}

module.exports = { createHistory, getHistory, getLastUpdatedClientHistory }