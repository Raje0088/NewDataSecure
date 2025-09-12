const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")
const { rawDataModel } = require("../models/rawDataModel.js")

const lastUpdatedTracker = async (clientId) => {
    try {
        await rawDataModel.findOneAndUpdate(
            {
                client_id: clientId,
            },
            {
                $set: {
                    database_status_db: "user_db",
                }
            },
            {
                new: true
            }
        )

        console.log("update successfully")
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const createSubscripbeUser = async (req, res) => {
    try {
        console.log("req body", req.body)
        const { clientSerialNo, clientId, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label,
            followUpDate, verifiedBy, tracker, amountDetails, amountHistory, action, followUpTime } = req.body;

        const clientSubscriptionId = clientId.replace("C", "U")

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

        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }


        const result = await clientSubscriptionModel.create({
            client_serial_no_id: clientSerialNo,
            client_id: clientId,
            client_subscription_id: clientSubscriptionId,

            userId_db: userId,

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
            date_db: new Date().toLocaleDateString('en-GB'),
            action_db: action,
            database_status_db: "user_db",
            tracking_db: tracker,
            label_db: label,
            amountDetails_db: amountDetails,
            amountHistory_db: amountHistory,
        })
        lastUpdatedTracker(clientId)
        console.log("User Details save Successfully", result)
        res.status(201).json({ message: "User Details save Successfully", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const updateUserScription = async (req, res) => {
    try {
        const clientSubscriptionId = req.params.id;
        const { clientSerialNo, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district,
            state, assignBy, assignTo,
            product, stage, quotationShare,
            expectedDate, remarks, label,
            followUpDate, verifiedBy, tracker, amountDetails, amountHistory, action, followUpTime } = req.body;
        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }
        console.log("====>", product)
        const clientId = clientSubscriptionId.replace("U", "C")

        const oldUser = await clientSubscriptionModel.findOne({ client_subscription_id: clientSubscriptionId })
        if (!oldUser) {
            return res.status(404).json({ message: "User not found in user db" })
        }

        const bussiness1 = bussinessNames[0].value || ""
        const bussiness2 = bussinessNames[1].value || ""
        const bussiness3 = bussinessNames[2].value || ""

        const email1 = emails[0].value || ""
        const email2 = emails[1].value || ""
        const email3 = emails[2].value || ""

        const mobile1 = numbers[0].value || ""
        const mobile2 = numbers[1].value || ""
        const mobile3 = numbers[2].value || ""

        const address1 = addresses[0].value || ""
        const address2 = addresses[1].value || ""
        const address3 = addresses[2].value || ""

        const updatedTracker = {
            ...tracker,
            recovery_db: {
                ...tracker?.recovery_db,
                recoveryHistory: tracker?.recovery_db?.recoveryHistory || [],
            }
        }

        const result = await clientSubscriptionModel.findOneAndUpdate(
            { client_subscription_id: clientSubscriptionId },
            {
                $set: {
                    client_serial_no_id: clientSerialNo,
                    client_id: clientId,
                    client_subscription_id: clientSubscriptionId,
                    userId_db: userId,
                    client_name_db: clientName,

                    optical_name1_db: bussiness1,
                    optical_name2_db: bussiness2,
                    optical_name3_db: bussiness3,

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

                    website_db: website,
                    pincode_db: pincode,
                    district_db: district,
                    state_db: state,
                    followup_db: followUpDate,
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
                    date_db: new Date().toLocaleDateString('en-GB'),
                    action_db: action,
                    database_status_db: "user_db",
                    label_db: label,
                    tracking_db: updatedTracker,
                    amountDetails_db: amountDetails,
                    amountHistory_db: amountHistory,
                }
            },
            { new: true }
        )
         lastUpdatedTracker(clientId)
        console.log("User Updated Successfully", result)
        res.status(200).json({ message: "User Updated Successfully", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const searchUserSubsciption = async (req, res) => {
    try {
        const clientSubscriptionId = req.params.id;
        const result = await clientSubscriptionModel.findOne({ client_subscription_id: clientSubscriptionId })
        console.log("user found ", result)
        res.status(200).json({ message: "user found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const CheckUserSubsciptionToRedirect = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await clientSubscriptionModel.findOne({ client_id: clientId })
        console.log("user found ", result)
        res.status(200).json({ message: "user found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getAllUserSubsriptionIds = async (req, res) => {
    try {
        const result = await clientSubscriptionModel.find().sort({ client_subscription_id: 1 })
        console.log("ids found", result.length, result)
        res.status(200).json({ message: "ids found", totalCount: result.length, result })

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FILTER ALL USER DB
const filterClientSubscriptionData = async (req, res) => {
    try {
        const { clientName, opticalName, address, mobile, email, district, state, country, hot,
            followUp, demo, installation, product, defaulter, recovery, lost, dateFrom, dateTo, clientType, } = req.query;
        const { page = 1 } = req.query;
        const limit = 500;
        const skip = (page - 1) * limit;
        console.log("query", req.query)

        const filters = {}
        const orConditions = [];

        if (clientName) filters.client_name_db = { $regex: clientName, $options: "i" }
        if (opticalName) {
            orConditions.push(
                { optical_name1_db: { $regex: opticalName, $options: "i" } },
                { optical_name2_db: { $regex: opticalName, $options: "i" } },
                { optical_name3_db: { $regex: opticalName, $options: "i" } }
            );
        }
        if (address) {
            orConditions.push(
                { address_1_db: { $regex: address, $options: "i" } },
                { address_2_db: { $regex: address, $options: "i" } },
                { address_3_db: { $regex: address, $options: "i" } }
            );
        }

        if (mobile) {
            orConditions.push(
                { mobile_1_db: { $regex: mobile, $options: "i" } },
                { mobile_2_db: { $regex: mobile, $options: "i" } },
                { mobile_3_db: { $regex: mobile, $options: "i" } }
            );
        }

        if (email) {
            orConditions.push(
                { email_1_db: { $regex: email, $options: "i" } },
                { email_2_db: { $regex: email, $options: "i" } },
                { email_3_db: { $regex: email, $options: "i" } }
            );
        }
        if (orConditions.length > 0) {
            filters.$or = orConditions;
        }
        if (district) filters.district_db = { $regex: district, $options: "i" }
        if (state) filters.state_db = { $regex: state, $options: 'i' }
        if (country) filters.country_db = { $regex: country, $options: 'i' }
        if (product) filters.product_db = { $regex: product, $options: "i" };

        if (hot) filters["tracking_db.hot_db.completed"] = hot
        if (followUp) filters["tracking_db.follow_up_db.completed"] = followUp;
        if (demo) filters["tracking_db.demo_db.completed"] = demo
        if (installation) filters["tracking_db.installation_db.completed"] = installation
        if (defaulter) filters["tracking_db.defaulter_db.completed"] = defaulter
        if (recovery) filters["tracking_db.recovery_db.completed"] = recovery
        if (lost) filters["tracking_db.lost_db.completed"] = lost
        if (dateFrom && dateTo) filters.date_db = { $gte: dateFrom, $lte: dateTo }


        const result = await clientSubscriptionModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
        const totalCount = await clientSubscriptionModel.countDocuments(filters)
        res.status(200).json({ message: "Client det.completedails filter result", page: page, limit: limit, totalCount: totalCount, resultCount: result.length, result, db: "User Database" })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const CheckUserIdforExcelSheet = async (req, res) => {
    try {
        const clientId = req.params.id
        const result = await clientSubscriptionModel.findOne({ client_id: clientId })
        res.status(200).json({ message: "User found", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
module.exports = { createSubscripbeUser, CheckUserIdforExcelSheet, filterClientSubscriptionData, getAllUserSubsriptionIds, updateUserScription, searchUserSubsciption, CheckUserSubsciptionToRedirect }  