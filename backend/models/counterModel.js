const mongoose = require("mongoose");

const clientHistoryVisitCounterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value:{type:Number,default:0},
})
const Counter = mongoose.model("counters",clientHistoryVisitCounterSchema);
module.exports= {Counter}