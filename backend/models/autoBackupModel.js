const mongoose = require("mongoose")

const AutoBackupEmailsSchema = new mongoose.Schema({
    email_db: { type: String, unique: true },
    userId_db: String,
    issender_db: { type: Boolean, default: false },
    pass_db: String,
}, { timestamps: true })

const autoBackupEmailModel = mongoose.model("autoBackupEmailsModel", AutoBackupEmailsSchema)

module.exports = { autoBackupEmailModel }