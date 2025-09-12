const mongoose = require("mongoose");
const connectDB = require("../config/db.js")
const path = require("path");
const fs = require("fs")
const { clientModel } = require("../models/clientModel.js")
const { pinCodeModel } = require("../models/dumpIndiaData.js");
async function dump(){
  try{
        await connectDB(); // connect to the DB

    // Update all records to add country field if not exists
    const result = await pinCodeModel.updateMany(
      { country_db: { $exists: false } },
      { $set: { country_db: "INDIA" } }
    );

    console.log("Country field added to all documents:", result.modifiedCount);
    console.log("Country field added to all documents");
  }catch(err){
    console.log("err",err)
  }

}
dump(); 

 
async function importData() {
    try {
        await connectDB();
        const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, "../ZDUMPING/files/Test_list.json"), 'utf-8'));

        const formatData = jsonData.map((item) => ({
            client_id: item.SrNo,
            optical_name_db: item.OpticalName,
            client_name_db: item.ClientName,
            address_db: item.Address,
            district_db: item.District,
            state_db: item.State,
            pincode_db: item.Pincode,
            mobile_1_db: item.Mobile1,
            mobile_2_db: item.Mobile2,
            mobile_3_db: item.Mobile3,
            email_1_db: item.Email1,
            email_2_db: item.Email2,
            followup_db: item.Followup,
        }))

        await clientModel.insertMany(formatData)
        console.log("Data imported successfully.");
        mongoose.disconnect();
    } catch (error) {
        console.error("Import error:", error);
    }
}
// importData()
 
//Note: MUST THIS FILE RUN FROM ROOT DIR --->COMMAND TO RUN  - node .\ZDUMPING\manuallyDump.js
