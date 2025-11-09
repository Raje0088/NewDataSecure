const { UserModel } = require("../models/user")
const { rawDataModel } = require("../models/rawDataModel")

function getDateAndTime() {
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000 //milliseconds
    const curTime = new Date(now.getTime() + istOffset).toISOString()
    const dateAndTime = curTime.split(".")[0]
    return dateAndTime;
}


const assignMasterDataArea = async (assignTo, state, district, pincode = [], force = false) => {
    // ensure it's always an array
        if (!assignTo || !state || !district) {
        return {
            success: false,
            message: "assignTo, state, and district are required fields."
        };
    }
    if (!Array.isArray(pincode)) {
        pincode = [];
    }

    const AlreadyExist = await UserModel.findOne({ "master_data_db.area.stateName": state, "master_data_db.area.district.districtName": district })
    if (AlreadyExist && !force) {
        // console.log(`${state}, ${district} already assign to ${AlreadyExist.generateUniqueId}`)
        return { success: false, askConfirmation: true, message: `${state}, ${district} already assign to ${AlreadyExist.generateUniqueId}` }
    }
    console.log("alreadyxit", AlreadyExist)
    const totalCount = await rawDataModel.countDocuments({ state_db: state, district_db: district, isActive_db: true })
    const user = await UserModel.findOne({ generateUniqueId: assignTo });
    let stateObj = user.master_data_db.area.find((s) => s.stateName === state)

    if (!stateObj) {
        user.master_data_db.area.push({
            stateName: state,
            totalCnt: totalCount,
            district: [{
                districtName: district,
                totalDistCnt: totalCount,
                pincodes: pincode.length > 0 ? pincode.map(code => ({ code: code, clientIds: [] })) : [],
            }]
        })
    } else {
        let districtObj = stateObj.district.find((d) => d.districtName === district)
        if (!districtObj) {
            stateObj.district.push({
                districtName: district,
                totalDistCnt: totalCount,
                pincodes: pincode.length > 0
                    ? pincode.map(code => ({ code: code, clientIds: [] }))
                    : []
            })
            stateObj.totalCnt = stateObj.totalCnt + totalCount
        } else {
            const existingCode = districtObj.pincodes.map(p => p.code)
            const newCodes = pincode.filter(code => !existingCode.includes(code))

            if (newCodes.length > 0) {
                newCodes.forEach(code => {
                    districtObj.pincodes.push({ code, clientIds: [] })
                })
                districtObj.totalDistCnt = districtObj.totalDistCnt + totalCount
            }
        }

    }

    await user.save();
    return {
        success: true,
        message: `${state}, ${district} assigned successfully to ${assignTo}`
    };
}

module.exports = { getDateAndTime, assignMasterDataArea }