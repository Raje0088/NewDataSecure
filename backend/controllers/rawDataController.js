const { rawDataModel } = require("../models/rawDataModel")
const { clientModel } = require("../models/clientModel")
const {clientSubscriptionModel} =require("../models/clientSubscriptionModel")
const csv = require("csvtojson");
const xlsx = require("xlsx");
const fs = require("fs")
const path = require("path");
const assetPath = require("../utils/assetPath")
const { getNextGobalCounterSequence, getNextGobalCounterSequenceForRaw } = require("../utils/getNextSequence");
const { districtnames, statenames } = require("../utils/MasterPlaceList")
const stringSimilarity = require("string-similarity");
const { viewExcelModel } = require("../models/viewExcelModel");
const paths = require("../utils/assetPath")

const correctSpelling = (input, masterList) => {
    if (!input) return "";
    const bestMatch = stringSimilarity.findBestMatch(input.trim().toUpperCase(), masterList.map((list) => list.trim().toUpperCase()))
    return bestMatch.bestMatch.rating > 0.7 ? masterList[bestMatch.bestMatchIndex] : "";
}

//RAW DATA DUMP FROM SUPERADMIN  PAGE
const rawDataDump = async (req, res) => {
    try {
        const userId = req.query.userId
        console.log("UserID:", userId);
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders(); // Important: starts sending stream right away


        const fileName = req.params.filename;
        const filePath = path.join(assetPath.uploadExcel, fileName);

        console.log("File:", fileName);

        if (!fs.existsSync(filePath)) {
            res.write(`event: error\ndata: ${JSON.stringify({ message: "File not found" })}\n\n`);
            return res.end();
        }

        const ext = path.extname(filePath);
        let jsonArray;

        if (ext === ".csv") {
            jsonArray = await csv().fromFile(filePath);
        } else if (ext === ".xlsx") {
            const workbook = xlsx.readFile(filePath);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonArray = xlsx.utils.sheet_to_json(sheet);
        } else {
            res.write(`event: error\ndata: ${JSON.stringify({ message: "Unsupported file type" })}\n\n`);
            return res.end();
        }


        if (!jsonArray.length) {
            res.write(`event: error\ndata: ${JSON.stringify({ message: "Empty file" })}\n\n`);
            return res.end();
        }

        let count = 0;
        const total = jsonArray.length;
        let errorDistArray = []
        let errorStateArray = []
        let formattedDataArray = [];
        let currentSerialNo = await getNextGobalCounterSequenceForRaw("rawSerialNumber");
        let SrNo = currentSerialNo;
        const curTime = Date.now()

        for (let i = 0; i < jsonArray.length; i++) {
            const item = jsonArray[i];
            try {

                const correctDistrict = correctSpelling(item.District, districtnames)
                const correctState = correctSpelling(item.State, statenames)
                let isError = false
                if (!correctDistrict || !item.District) {
                    errorDistArray.push(`${i + 2}-${item.District || "EMPTY"}`);
                    isError = true
                }
                if (!correctState || !item.State) {
                    errorStateArray.push(`${i + 2}-${item.State || "EMPTY"}`);
                    isError = true
                }
                if (isError) continue


                SrNo++;
                const formattedData = {
                    client_serial_no_id: SrNo,
                    client_id: `C${String(SrNo).padStart(7, "0")}`,
                    optical_name1_db: item.OpticalName || "",
                    client_name_db: item.ClientName || "",
                    address_1_db: item.Address1 || "",
                    district_db: correctDistrict,
                    state_db: correctState,
                    country_db: item.country || 'INDIA',
                    pincode_db: item.Pincode || "",
                    mobile_1_db: item.Mobile1 || "",
                    mobile_2_db: item.Mobile2 || "",
                    mobile_3_db: item.Mobile3 || "",
                    email_1_db: item.Email1 || "",
                    email_2_db: item.Email2 || "",
                    followup_db: item.Followup || "",
                    dumpBy_db: `${userId}_${curTime}`,
                };

                formattedDataArray.push(formattedData);

                count++;
                const progress = Math.floor((count / total) * 100);

                // Send progress update
                res.write(`event: progress\ndata: ${JSON.stringify({ progress, count })}\n\n`);

            } catch (rowError) {
                res.write(`event:error:\ndata: ${JSON.stringify({
                    message: "Erron in row number : ",
                    row: i + 2, error: rowError.message
                })}\n\n`)
            }
        }

        // Send completion event
        if (errorDistArray.length > 0 || errorStateArray.length > 0) {
            res.write(`event: error\ndata: ${JSON.stringify({
                message: "Validation failed. Fix errors and re-upload.",
                errorsDist: errorDistArray,
                errorsState: errorStateArray,
            })}\n\n`);
            return res.end();
        }

        // Insert all valid records at once
        if (formattedDataArray.length > 0) {
            await getNextGobalCounterSequenceForRaw("rawSerialNumber", SrNo)
            await rawDataModel.insertMany(formattedDataArray);
            await viewExcelModel.create({
                userId_db: userId,
                excelURL_db: `/uploadExcel/${fileName}`,
                date_db: new Date().toLocaleDateString("en-GB"),
                time_db: new Date().toLocaleTimeString(),
                total_db: count,
                dumpBy_db: `${userId}_${curTime}`,
            })
        }
        res.write(`event: complete\ndata: ${JSON.stringify({ message: "Upload complete", total })}\n\n`);
        res.end()
    } catch (err) {
        console.error("Error in rawDataDump:", err);
        res.write(`event: error\ndata: ${JSON.stringify({ message: "Internal error", error: err.message })}\n\n`);
        res.end();
    }
};


const createNewRawDBRecord = async (req, res) => {
    try {
        const { clientDetails } = req.body;
        const oldRecord = await rawDataModel.findOne({ client_db: clientDetails.clientId })

        if (oldRecord) return res.status(500).json({ message: "Client Id already exist in raw DB" })

        const SrNo = await getNextGobalCounterSequence("rawSerialNumber");
        const result = await rawDataModel.create({
            client_serial_no_id: SrNo,
            client_id: `C${String(SrNo).padStart(7, '0')}`,
            optical_name1_db: clientDetails.bussinessNames[0]?.value || "",
            client_name_db: clientDetails.clientName || "",
            address_1_db: clientDetails.addresses[0]?.value || "",
            district_db: clientDetails.district || "",
            state_db: clientDetails.state || "",
            pincode_db: clientDetails.pincode || "",
            mobile_1_db: clientDetails.numbers[0]?.value || "",
            mobile_2_db: clientDetails.numbers[1]?.value || "",
            mobile_3_db: clientDetails.numbers[2]?.value || "",
            email_1_db: clientDetails.emails[0]?.value || "",
            email_2_db: clientDetails.emails[1]?.value || "",
            followup_db: clientDetails.followUpDate || "",
            dump_db: "manual",
        })
        console.log("new record added in raw db", result)
        res.status(201).json({ message: "new record added in raw db", result })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//searching client id in raw data to extract client details on client page 
// this controller only used to show srno and clientId 

const getrawDataDump = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await rawDataModel.findOne({
            client_id: clientId
        })
        console.log("client id search found", result);
        res.status(200).json({ message: "client id search found", result })
    } catch (err) {
        console.log("internal error in getrawDataDump", err)
        res.status(500).json({ message: "internal error in getrawDataDump", err: err.message })
    }
}

const getrawDataNewFormId = async (req, res) => {
    try {
        const lastClientId = await rawDataModel.findOne().sort({ client_id: -1 })
        res.status(200).json({ message: "last Id in raw db is ", lastClientId })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const deactivateRawData = async (req, res) => {
    try {
        const clientId = req.params.id;

        const clientToDeactivate = await rawDataModel.findOne({ ClientId_db: clientId })
        console.log("clientData", clientToDeactivate)
        if (!clientToDeactivate) {
            return res.status(404).json({ message: "client not found or already deactivated" })
        }
        const srNoToDeactivate = clientToDeactivate.SrNo_db;
        //step 1:set isActive false
        const result = await rawDataModel.updateOne(
            { ClientId_db: clientId, isActive_db: true },
            { $set: { isActive_db: false } }
        )
        //step 2: shift all srno_db of isActive rows that are greater than deactivated one
        const updateSrNo = await rawDataModel.updateMany(
            { SrNo_db: { $gt: srNoToDeactivate }, isActive_db: true },
            { $inc: { SrNo_db: -1 } }
        )
        res.status(200).json({ message: `Deactivated SrNo ${srNoToDeactivate}`, result, updateSrNo })
    } catch (err) {
        res.status(500).json({ message: "Error during deactivation", err: err.message });
        console.log("Error during deactivation", err)
    }
}
const activateRawData = async (req, res) => {
    try {
        const clientId = req.params.id;
        const clientToActivate = await rawDataModel.findOne({ ClientId_db: clientId, isActive_db: false })

        if (!clientToActivate) {
            return res.status(404).json({ message: "Client not found or already active" });
        }

        const activeCount = await rawDataModel.countDocuments({
            isActive_db: true,
        })
        const newSrNo = activeCount + 1;

        // set client active to true
        const result = await rawDataModel.updateOne(
            { ClientId_db: clientId },
            {
                $set: {
                    isActive_db: true,
                    SrNo_db: newSrNo
                }
            }
        )
        // Now fetch the updated document or update the old one

        console.log("activate client", clientToActivate);
        res.status(200).json({
            message: `Client ${clientId} activated and SrNo ${newSrNo}`
        });
    } catch (err) {
        res.status(500).json({ message: "Error during activation", err: err.message })
        console.log("Error during activation ", err)
    }
}

//GET RAW DATA FILTERS BY SEARCH
const filterRawData = async (req, res) => {
    try {
        const { clientId, clientName, opticalName, address, mobile, email, district, state, country, hot,
            followUp, demo, installation, product, defaulter, recovery, lost, dateFrom, dateTo, clientType, } = req.query;
        const { page = 1 } = req.query;
        const limit = 500;
        const skip = (page - 1) * limit;
        console.log("query", req.query)
        const filters = {}
        if (clientId) filters.client_id = clientId
        if (clientName) filters.client_name_db = { $regex: clientName, $options: "i" }
        if (opticalName) filters.optical_name1_db = { $regex: opticalName, $options: "i" }
        if (address) filters.address_1_db = { $regex: address, $options: "i" }
        if (mobile) filters.mobile_1_db = { $regex: mobile, $options: "i" }
        if (email) filters.email_1_db = { $regex: email, $options: "i" }
        if (district) filters.district_db = { $regex: district, $options: "i" }
        if (state) filters.state_db = { $regex: state, $options: 'i' }
        // if (country) filters.country = { $regex: country, $options: 'i' }
        // if (hot) filters.hot = { $regex: hot, $options: "i" }
        // if (followUp) filters.followUp = { $regex: followUp, $options: "i" }
        // if (demo) filters.demo = { $regex: demo, $options: "i" }
        // if (installation) filters.installation = { $regex: installation, $options: "i" }
        // if (product) filters.product = { $regex: product, $options: "i" }
        // if (defaulter) filters.defaulter = { $regex: defaulter, $options: "i" }
        // if (recovery) filters.recovery = { $regex: recovery, $options: "i" }
        // if (lost) filters.lost = { $regex: lost, $options: "i" }
        // if (dateFrom && dateTo) filters.date_db = { $gte: dateFrom, $lte: dateTo }

        let result, totalCount,db;
        const totalCountUser = await clientSubscriptionModel.countDocuments(filters)
        const totalCountClient = await clientModel.countDocuments(filters)

        if (totalCountUser > 0 && clientId || totalCountUser > 0 && clientName || totalCountUser > 0 && opticalName || totalCountUser > 0 && mobile) {
            result = await clientSubscriptionModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
            totalCount = await clientSubscriptionModel.countDocuments(filters)
            db="User Database"
        } else if (totalCountClient > 0 && clientId || totalCountClient > 0 && clientName || totalCountClient > 0 && opticalName || totalCountClient > 0 && mobile) {
            result = await clientModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
            totalCount = await clientModel.countDocuments(filters)
            db="Client Database"
        } else {
            result = await rawDataModel.find(filters).sort({ client_id: 1 }).skip(skip).limit(limit)
            totalCount = await rawDataModel.countDocuments(filters)
            db="Raw Database"
        }

        res.status(200).json({ message: "Client details filter result", page: Number(page), limit: limit, totalCount: totalCount, resultCount: result.length, result , db })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//RAW SAMPLE FILE TO  DOWNLOAD
const rawSampleFile = async (req, res) => {
    try {
        const file = "rawSampleFile.xlsx";
        const filePath = path.join(assetPath.sampleFile, file)
        // console.log("filePath", filePath)
        console.log("Looking for file at:", filePath);
        console.log("Exists?", fs.existsSync(filePath));

        if (!fs.existsSync(filePath)) {
            return res.status(404).send("File not found");
        }
        res.download(filePath, file)
    } catch (err) {
        console.log("internal errror", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

//FROM VIEW EXCEL PAGE DUMPID SENDING TO GET IMPORTED EXCEL SHEET
const rawDBExcelUploadData = async (req, res) => {
    try {
        const DumpId = req.params.id;

        const limit = 50
        console.log("dumpid", DumpId)
        const result = await rawDataModel.find({ dumpBy_db: DumpId }).sort({ client_id: 1 })
        console.log("Data found", result)
        res.status(200).json({ message: "Data found", total: result.length, result });
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}



module.exports = { rawDataDump, rawDBExcelUploadData, rawSampleFile, filterRawData, createNewRawDBRecord, getrawDataDump, getrawDataNewFormId, deactivateRawData, activateRawData }