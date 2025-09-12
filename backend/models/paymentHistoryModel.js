const mongoose = require("mongoose")

const paymentSchema = new mongoose.Schema({
    userId_db: String,
    client_id: { type: String },
    client_name_db: String,
    quotationShare_db: String,
    product_db: { type: String },
    gst_db:String,
    referenceId_db:String,
    mode_db:String,
    totalAmount_db: { type: Number, default: 0 },
    paidAmount_db: { type: Number, default: 0 },
    extraCharges_db: { type: Number, default: 0 },
    finalCost_db: { type: Number, default: 0 },
    newAmount_db: { type: Number, default: 0 },
    balanceAmount_db: { type: Number, default: 0 }
},{timestamps:true})

const paymentModel = mongoose.model("paymentModel",paymentSchema)

module.exports = {paymentModel}