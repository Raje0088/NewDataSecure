const mongoose = require("mongoose");
const { pinCodeModel } = require("../models/dumpIndiaData")
const { rawDataModel } = require("../models/rawDataModel")
const path = require("path")


const searchPincode = async (req, res) => {
    try {
        const { state, district, taluka, village, pincode, sortBy, sortOrder = "asc", lastId, limit = 30 } = req.query;

        // Build filter object
        let filter = {};
        if (state) filter.state_db = state.trim().toUpperCase();
        if (district) filter.district_db = district.trim().toUpperCase();
        if (taluka) filter.taluka_db = taluka.trim().toUpperCase();
        if (village) filter.village_db = village.trim().toUpperCase();
        if (pincode) filter.pincode_db = pincode.trim();

        //Cursor pagination
        if (lastId) filter._id = { $gt: new mongoose.Types.ObjectId(lastId) };

        //Build sort object
        let sort = {};
        if (sortBy) {
            sort[sortBy] = sortOrder === "desc" ? -1 : 1;
        } else {
            sort._id = 1;  //default sort by _id ascending
        }

        //Query DB
        const results = await pinCodeModel.find(filter).sort(sort).limit(parseInt(limit)).select("-__v"); // exclude version key

        //prepare cursor for next page
        const newLastId = results.length ? results[results.length - 1]._id : null;

        // Query total matching documents (without pagination)
        const totalCount = await pinCodeModel.countDocuments(filter);


        res.json({
            data: results,
            lastId: newLastId,
            count: results.length,
            totalCount,
        })

    } catch (err) {
        console.log("search failed internal error", err)
        res.status(500).json({ message: "search failed dur to internal error", err: err.message })
    }
}
const getStateDistrictVillageName = async (req, res) => {
    try {
        const { state, district, taluka, village, pincode } = req.query;

        const filter = {};
        if (state) filter.state_db = state;
        if (district) filter.district_db = district;
        if (taluka) filter.taluka_db = taluka;
        if (village) filter.village_db = village;
        if (pincode) filter.pincode_db = pincode;



        const statelist = await pinCodeModel.distinct("state_db", filter)
        const districtlist = await pinCodeModel.distinct("district_db", filter)
        const talukalist = await pinCodeModel.distinct("taluka_db", filter)
        const villagelist = await pinCodeModel.distinct("village_db", filter)
        const pincodelist = await pinCodeModel.distinct("pincode_db", filter)

        res.json({
            statename: statelist,
            districtname: districtlist,
            talukaname: talukalist,
            villagename: villagelist,
            pincodename: pincodelist,
        })

    } catch (err) {
        console.log("search failed internal error", err)
        res.status(500).json({ message: "search failed dur to internal error", err: err.message })
    }
} 

const createPincode = async (req, res) => {
    try {
        const { pincode, state, country, taluka, village, district, } = req.body;
        const existing = await pinCodeModel.findOne({ pincode_db: pincode });
        if (existing) {
            return res.status(200).json({
                message: "Pincode already exists in database",
                result: existing
            });
        }
        const result = await pinCodeModel.create({
            pincode_db: pincode,
            state_db: state,
            district_db: district,
            taluka_db: taluka,
            village_db: village,
            country_db: country,
            latterPincode_id: "#NewPincode$",
        })
        console.log("New Pincode Created Successfully", result);
        res.status(201).json({ message: "New Pincode Created Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const getLatterPincode = async (req, res) => {
    try {
        const total = await pinCodeModel.countDocuments()
        const result = await pinCodeModel.find({
            latterPincode_id: "#NewPincode$"
        }).sort({ _id: 1 })
        console.log("New Pincode found Successfully", result);
        res.status(201).json({ message: "New Pincode found Successfully", result,total })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
const updateLatterPincode = async (req, res) => {
    try {
        const { searchPincode, pincode, state, country, taluka, village, district, } = req.body;
        const result = await pinCodeModel.findOneAndUpdate(
            { pincode_db: searchPincode },
            {
                $set: {

                    pincode_db: pincode,
                    state_db: state,
                    district_db: district,
                    taluka_db: taluka,
                    village_db: village,
                    country_db: country,
                    latterPincode_id: "#NewPincode$",
                }
            },
            { new: true }
        )
        console.log("New Pincode found Successfully", result);
        res.status(201).json({ message: "New Pincode found Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const deleteLatterPincode = async (req, res) => {
    try {
        const { pincode } = req.body;
        const result = await pinCodeModel.findOneAndDelete({ pincode_db: pincode })
        console.log("New Pincode delete Successfully", result);
        res.status(201).json({ message: "New Pincode delete Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
} 

//FETCH  STATE,DISTRICT,COUNTRY,PINCODE WHICH PRESENT IN DB
const fetchPlaceRawDB = async (req, res) => {
    try {
        let districtArray = await rawDataModel.distinct("district_db")
        let stateArray = await rawDataModel.distinct("state_db")
        let countryArray = await rawDataModel.distinct("country_db")
        let pincodeArray = await rawDataModel.distinct("pincode_db")

        const newDistrict = districtArray.map(d => d.trim().toUpperCase()).sort()
        const newState = stateArray.map(s => s.trim().toUpperCase()).sort()
        const newCountry = countryArray.map(c => c.trim().toUpperCase()).sort()
        const newPincode = pincodeArray.map(p => p.trim().toUpperCase()).sort()

        res.status(200).json({ message: "pincode founds", districtArray:newDistrict, stateArray:newState, countryArray: newCountry, pincodeArray:newPincode })
    } catch (err) {
        console.log("internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const sampleExcelFile = async (req, res) => {
    try {
        const filepath = path.join(__dirname, "../sampleFile/sample.csv");
        res.download(filepath, "sample.csv", (err) => {
            if (err) {
                console.error("Error sending sample file:", err);
                if (!res.headersSent) {
                    res.status(500).send("Could not download the file.");
                }
            }
        });
    } catch (err) {
        console.log("internal error", err)
        if (!res.headersSent) {
            res.status(500).json({ message: "Internal error", err: err.message });
        }
    }
}

const getPincodedetails = async (req, res) => {
    try {
        console.log("New Pincode found Successfully", result);
        res.status(201).json({ message: "New Pincode found Successfully", result })
    } catch (err) {
        console.log("Internal error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}
 
module.exports = { deleteLatterPincode, sampleExcelFile, fetchPlaceRawDB, updateLatterPincode, searchPincode, getLatterPincode, createPincode, getStateDistrictVillageName }


//aggregation pipeline used
// app.get("/api/pincodes", async (req, res) => {
//   try {
//     const {
//       state,
//       district,
//       taluka,
//       village,
//       pincode,
//       sortBy,
//       sortOrder = "asc",
//       lastId,
//       limit = 20,
//     } = req.query;

//     const pipeline = [];

//     // Filtering
//     if (state) pipeline.push({ $match: { state_db: state.trim().toUpperCase() } });
//     if (district) pipeline.push({ $match: { district_db: district.trim().toUpperCase() } });
//     if (taluka) pipeline.push({ $match: { taluka_db: taluka.trim().toUpperCase() } });
//     if (village) pipeline.push({ $match: { village_db: village.trim().toUpperCase() } });
//     if (pincode) pipeline.push({ $match: { pincode_db: pincode.trim() } });

//     // Cursor pagination
//     if (lastId) {
//       pipeline.push({ $match: { _id: { $gt: mongoose.Types.ObjectId(lastId) } } });
//     }

//     // Sorting
//     let sortStage = {};
//     if (sortBy) {
//       sortStage[sortBy] = sortOrder === "desc" ? -1 : 1;
//     } else {
//       sortStage._id = 1;
//     }
//     pipeline.push({ $sort: sortStage });

//     // Limit
//     pipeline.push({ $limit: parseInt(limit) });

//     // Run aggregation
//     const results = await pinCodeModel.aggregate(pipeline);

//     const newLastId = results.length ? results[results.length - 1]._id : null;

//     res.json({
//       data: results,
//       lastId: newLastId,
//       count: results.length,
//     });
//   } catch (err) {
//     console.error("Aggregation search API error:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
