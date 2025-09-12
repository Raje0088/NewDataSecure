const { Counter } = require("../models/counterModel")

//get next counter uniquely is DYNAMIC for any field like srno, client visiting id, invoice no, etc. --> from CounterModel
const getNextGobalCounterSequence = async (counterKey) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }, // new:true returnupdated doc, upsert:true creates if not exist
    )
    if (!counter || counter.sequence_value === undefined) {
        throw new Error("Failed to get sequene value")
    }
    return counter.sequence_value;
}
const getNextGobalCounterSequenceForRaw = async (counterKey, newValue) => {
    const counter = await Counter.findOneAndUpdate(
        { _id: counterKey },
        { $set: { sequence_value: newValue } },
        { new: true, upsert: true }, // new:true returnupdated doc, upsert:true creates if not exist
    )
    if (!counter || counter.sequence_value === undefined) {
        throw new Error("Failed to get sequene value")
    }
    return counter.sequence_value;
}

// why rawDataModel.findOne().sort({clientid:-1}) failed ? 
// becoz if two request send at same time then same id will return lead to error
module.exports = { getNextGobalCounterSequence, getNextGobalCounterSequenceForRaw }