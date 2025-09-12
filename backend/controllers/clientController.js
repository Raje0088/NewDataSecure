const { clientModel } = require("../models/clientModel.js")
const { clientHistoryModel } = require("../models/clientModel.js");
const { rawDataModel } = require("../models/rawDataModel.js")

const lastUpdatedTracker = async (clientId) => {
    try {
        await rawDataModel.findOneAndUpdate(
            {
                client_id: clientId,
            },
            {
                $set: {
                    database_status_db: "client_db",
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

const GenerateClientSerialNumber = async (req, res) => {
    try {
        const lastClient = await clientModel.findOne().sort({ _id: -1 })

        let nextId = "C1";

        if (lastClient && lastClient.client_id) {
            const lastNumber = parseInt(lastClient.client_id.replace("C", ""));
            const newNumber = lastNumber + 1;
            nextId = "C" + newNumber;
        }

        console.log("GenerateClient serial number is ", nextId)
        res.status(200).json({ message: "GenerateClient serial number is ", nextId })
    } catch (err) {
        console.log("Internal Error in GenerateClientSerialNumber", err)
        res.status(500).json({ message: "Internal Error in GenerateClientSerialNumber", err: err.message })
    }
}
const createClient = async (req, res) => {
    try {
        const { clientSerialNo, clientId, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district,
            state, assignBy, assignTo,
            product, stage, quotationShare, database,
            expectedDate, remarks, label, completion,
            followUpDate, verifiedBy, tracker, amountDetails, action, followUpTime } = req.body;
        // console.log("req body", amountDetails)

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

        // console.log("tracking -------------->", tracker)
        const result = await clientModel.create({
            client_serial_no_id: clientSerialNo,
            client_id: clientId,
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
            database_status_db: database || "client_db",
            tracking_db: tracker,
            label_db: label,
            completion_db: completion,
            amountDetails_db: amountDetails,
        })

        lastUpdatedTracker(clientId);
        console.log("Client Details save Successfully", result)
        res.status(201).json({ message: "Client Details save Successfully", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error in create client", err: err.message })
    }
}

const updateClient = async (req, res) => {
    try {
        const clientId = req.params.id;

        const oldClient = await clientModel.findOne({ client_id: clientId, })
        if (!oldClient) {
            res.status(404).json({ message: "client not found" })
        }

        const { clientSerialNo, userId, bussinessNames, clientName,
            numbers, emails, website,
            addresses, pincode, district,
            state, assignBy, assignTo,
            product, stage, quotationShare, database,
            expectedDate, remarks, label, completion,
            followUpDate, verifiedBy, tracker, amountDetails, action, followUpTime } = req.body;

        // Check if installation was not previously completed
        const wasInstallationDone = oldClient.tracking_db?.installation_db?.completed;

        let existingRecovery = oldClient.tracking_db?.recovery_db?.recoveryHistory || []

        if (!wasInstallationDone && tracker?.installation_db?.completed) {
            const recoveryRecord = {
                recoverAmount: amountDetails?.paidAmount || 0,
                recoverAmountDate: new Date().toLocaleDateString("en-GB")
            }
            existingRecovery.push(recoveryRecord)
        }

        const bussiness1 = bussinessNames[0].value || "";
        const bussiness2 = bussinessNames[1].value || "";
        const bussiness3 = bussinessNames[2].value || "";

        const email1 = emails[0].value || ""
        const email2 = emails[1].value || ""
        const email3 = emails[2].value || ""

        const mobile1 = numbers[0].value || ""
        const mobile2 = numbers[1].value || ""
        const mobile3 = numbers[2].value || ""

        const address1 = addresses[0].value || ""
        const address2 = addresses[1].value || ""
        const address3 = addresses[2].value || ""

        let { callType, country } = req.body;

        if (callType === "") {
            callType = "out-bound"
        }
        if (country === "") {
            country = "INDIA"
        }


        const result = await clientModel.findOneAndUpdate({ client_id: clientId },
            {
                $set: {
                    client_serial_no_id: clientSerialNo,
                    client_id: clientId,
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
                    database_status_db: database || "client_db",
                    label_db: label,
                    completion_db: completion,
                    tracking_db: {
                        ...tracker,
                        recovery_db: {
                            ...tracker.recovery_db, recoveryHistory: existingRecovery
                        }
                    },
                    amountDetails_db: amountDetails,
                }
            },
            { new: true }
        )

        lastUpdatedTracker(clientId);
        res.status(200).json({ message: "Client Updated Successfully", updatedClient: result })

    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal eror", err: err.message })
    }
}



const getClientsAssignedToEmployee = async (req, res) => {
    try {
        const userId = req.params.userId; // OR from req.user if token-based
        const clients = await clientModel.find({ assignTo: userId })
            .populate("assignBy", "name roleName")
            .populate("assignTo", "name roleName")

        res.status(200).json({ message: "Clients assigned to user fetched successfully", clients })
    } catch (err) {
        console.log("error fetching clients", err);
        res.status(500).json({ message: "Failed to fetch clients", err: err.message })
    }
}

//  TO CHECK FIRST ENTRY AVAILABLE IN CLEINT DB OR NOT
const getCheckClientIdPresent = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await clientModel.findOne({ client_id: clientId })
        if (result) {
            res.status(200).json({ message: "present", result })
        } else {
            res.status(200).json({ message: "absent" })

        }
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//SEARCHING CLIENT ID FROM CLIENT DB
const searchByClientId = async (req, res) => {
    try {
        const id = req.params.id.trim();
        const result = await clientModel.findOne({ client_id: id })
        if (!result) {
            return res.status(404).json({ message: "Client Not Found", result: null });
        }
        console.log("search Id found", result)
        res.status(200).json({ message: "search Id found", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//SEARCHING CLIENT TRHOUGH NAME, BUSINESS,MOBILE, ADDRESS,PIN, ETC TO GET ALL MATCH DETAILS 
const searchAllClientsThroughQuery = async (req, res) => {
    try {
        const { name, opticalName, mobile, address, pincode, district, state, clientId, email } = req.query;
        console.log("searches are", name, opticalName, mobile, address, pincode, district, state, clientId, email)
        let filters = {}
        let andConditions = [];

        if (name) { andConditions.push({ client_name_db: { $regex: name.trim(), $options: "i" } }) }
        if (pincode && pincode.length === 6) { andConditions.push({ pincode_db: { $regex: pincode, $options: "i" } }) }
        if (district) { andConditions.push({ district_db: { $regex: district, $options: "i" } }) }
        if (state) { andConditions.push({ state_db: { $regex: state, $options: "i" } }) }
        if (clientId) { andConditions.push({ client_id: { $regex: clientId, $options: "i" } }) }
        if (opticalName) {
            andConditions.push({
                $or: [
                    { optical_name1_db: { $regex: opticalName, $options: "i" } },
                    { optical_name2_db: { $regex: opticalName, $options: "i" } },
                    { optical_name3_db: { $regex: opticalName, $options: "i" } }
                ]
            })
        }

        if (mobile) {
            andConditions.push({
                $or: [
                    { mobile_1_db: { $regex: mobile, $options: "i" } },
                    { mobile_2_db: { $regex: mobile, $options: "i" } },
                    { mobile_3_db: { $regex: mobile, $options: "i" } },
                ]
            })
        }

        if (address) {
            andConditions.push({
                $or: [
                    { address_1_db: { $regex: address, $options: "i" } },
                    { address_2_db: { $regex: address, $options: "i" } },
                    { address_3_db: { $regex: address, $options: "i" } },
                ]
            })
        }

        if (email) {
            andConditions.push({
                $or: [
                    { email_1_db: { $regex: email, $options: "i" } },
                    { email_2_db: { $regex: email, $options: "i" } },
                    { email_3_db: { $regex: email, $options: "i" } },
                ]
            })
        }
        let finalFilters = {};
        if (andConditions.length > 0) {
            finalFilters.$and = andConditions;
        }
        const result = await clientModel.find(finalFilters).sort({ client_id: 1 })
        if (result.length === 0) {
            return res.status(200).json({ message: "No Search found", totalCount: result.length, result: result });
        }
        res.status(200).json({ message: "Searches found", totalCount: result.length, result: result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FILTER ALL CLIENT DB BY SEARCH
const filterClientData = async (req, res) => {
    try {
        const { clientId, clientName, opticalName, address, mobile, email, district, state, country, hot,
            followUp, demo, installation, product, defaulter, recovery, lost, dateFrom, dateTo, clientType, } = req.query;
        const { page = 1 } = req.query;
        const limit = 500;
        const skip = (page - 1) * limit;
        // console.log("query", req.query)

        const filters = {}
        const orConditions = [];

        if (clientId) filters.client_id = clientId
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

        if (hot === "true") filters["tracking_db.hot_db.completed"] = true
        if (followUp === "true") filters["tracking_db.follow_up_db.completed"] = true;
        if (demo === "true") filters["tracking_db.demo_db.completed"] = true
        if (installation === "true") filters["tracking_db.installation_db.completed"] = true
        if (defaulter === "true") filters["tracking_db.defaulter_db.completed"] = true
        if (recovery === "true") filters["tracking_db.recovery_db.completed"] = true
        if (lost === "true") filters["tracking_db.lost_db.completed"] = true
        if (dateFrom && dateTo) filters.date_db = { $gte: dateFrom, $lte: dateTo }


        const result = await clientModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
        const totalCount = await clientModel.countDocuments(filters)
        res.status(200).json({ message: "Client data completedails filter result", page: page, limit: limit, totalCount: totalCount, resultCount: result.length, result, db: "Client Database" })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FOR VIEW EXCEL DATA IN VIEW MODE IN SEARCH PAGE THIS CONTROLER TO CHECK IF CLIENT ID PRESENT IN CLIENT ID OR NOT
const CheckClientIdforExcelSheet = async (req, res) => {
    try {
        const clientId = req.params.id
        const result = await clientModel.findOne({ client_id: clientId })
        res.status(200).json({ message: "client found", result })
    } catch (err) {
        console.log('internal error', err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}


module.exports = { searchAllClientsThroughQuery, CheckClientIdforExcelSheet, filterClientData, searchByClientId, GenerateClientSerialNumber, createClient, updateClient, getClientsAssignedToEmployee, getCheckClientIdPresent }