const { paymentModel } = require("../models/paymentHistoryModel")

const createPaymentHistory = async (req, res) => {
    try {
        const { amountDetails, userId, clientId, clientName, quotationShare, product, } = req.body;
        console.log("amountDetails=================================",userId, amountDetails)
        const result = await paymentModel.create({
            userId_db: userId,
            client_id: clientId,
            client_name_db: clientName,
            quotationShare_db: quotationShare,
            product_db: product,
            totalAmount_db: amountDetails.totalAmount,
            paidAmount_db: amountDetails.paidAmount,
            extraCharges_db: amountDetails.extraCharges,
            finalCost_db: amountDetails.finalCost,
            newAmount_db: amountDetails.newAmount,
            balanceAmount_db: amountDetails.balanceAmount,
            gst_db: amountDetails.gst,
            referenceId_db: amountDetails.referenceId,
            mode_db: amountDetails.mode,
        })
        res.status(201).json({ message: "User Payment Save Successfully", result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

const getPaymentHistory = async (req, res) => {
    try {
        const clientId = req.params.id;
        const result = await paymentModel.find({ client_id: clientId })
        res.status(201).json({ message: "User Payment Receipt", result })
    } catch (err) {
        console.log("internal  error", err)
        res.status(500).json({ message: "internal error", err: err.message })
    }
}

module.exports = { createPaymentHistory ,getPaymentHistory}