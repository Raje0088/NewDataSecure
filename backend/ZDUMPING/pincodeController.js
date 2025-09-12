const xlsx = require("xlsx");
// const fs = require("fs")
const fs = require("fs/promises");
const path = require("path");
const { pinCodeModel } = require("../models/dumpIndiaData");

const uploadPincodeExcel = async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../ZDUMPING/files", filename);

    if (!fs.existsSync(filePath)) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "File not found" })}\n\n`);
      return res.end();
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    const total = data.length
    let count = 0;
    const BATCH_SIZE = 1000;
    let formatted = [];
    console.log("hello pincode")
    for (const row of data) {
      count++;

      formatted.push({
        state_db: row.statename || "",
        district_db: row.district || "",
        country_db: row.country || "INDIA",
        pincode_db: row.pincode || "",
      });

      // Small delay to simulate I/O and allow streaming
      if (formatted.length === BATCH_SIZE) {
        await pinCodeModel.insertMany(formatted);
        formatted = []
        const progress = Math.ceil((count / data.length) * 100);
        console.log(`Progress: ${progress}% (${count}/${data.length})`);
        res.write(`event: progress\ndata: ${JSON.stringify({ progress, count, total })}\n\n`);

      }
    }
    if (formatted.length > 0) {
      await pinCodeModel.insertMany(formatted);
      const progress = Math.ceil((count / data.length) * 100);
      res.write(`event: progress\ndata: ${JSON.stringify({ progress, count, total })}\n\n`);
    }


    res.write(`event: complete\ndata: ${JSON.stringify({ message: "Upload done", total: count })}\n\n`);
    setTimeout(() => res.end(), 200);
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const autoAploadPincodeJsonData = async () => {
  try {
    const totalCount = await pinCodeModel.countDocuments();
    if (totalCount > 1) {
      // console.log(`Total pincode exist ${totalCount}`)
      return
    }

    const filePath = path.join(__dirname, "files", "pincodeFile.json")
    let formatted = []
    const data = await fs.readFile(filePath, "utf-8");
    const jsonData = JSON.parse(data);
    formatted = jsonData.map((row) => ({
      state_db: row.state_db?.toUpperCase() || "",
      district_db: row.district_db?.toUpperCase() || "",
      country_db: row.country_db?.toUpperCase() || "",
      pincode_db: row.pincode_db || "",
    }));

    console.log(`Pincode Uploading in  process...`)
    const result = await pinCodeModel.insertMany(formatted)

    console.log(`✅ Pincode upload complete. Total pincodes uploaded: ${result.length}`);
  } catch (err) {
    console.log("internal error", err)
  }
}




module.exports = { uploadPincodeExcel, autoAploadPincodeJsonData };
