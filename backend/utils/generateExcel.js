const xlsx = require("xlsx")
const { rawDataModel } = require("../models/rawDataModel")
const { clientModel } = require("../models/clientModel")
const { clientSubscriptionModel } = require("../models/clientSubscriptionModel")

//THIS DOWNLOAD 500 RECORDS IN EXCEL SHEET
// const generateExcelSheet = async (dataArray, sheetName) => {
//   try {
//     const sheet = xlsx.utils.json_to_sheet(dataArray) //convert json to worksheet
//     const workbook = {
//       SheetNames: [sheetName],
//       Sheets: {
//         [sheetName]: sheet
//       }
//     }
//     const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" })

//     return buffer;
//   } catch (err) {
//     console.log('internal error', err)
//     throw err;
//   }
// }

//THIS DOWNLOAD 500 RECORDS IN EXCEL SHEET
// const excelDownloadController = async (req, res) => {
//   const { dataArray, sheetName } = req.body;
//   const buffer = await generateExcelSheet(dataArray, sheetName || "Sheet1");
//   console.log("buffer",buffer)

//   res.setHeader(
//     "Content-Type", 
//     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//   );
//   res.setHeader(
//     "Content-Disposition",
//     `attachment; filename=${sheetName || "Sheet1"}.xlsx`
//   );

//   res.send(buffer);
// };

const excelDownloadController = async (req, res) => {
  try {
    const { database, state, district } = req.body;
    const sheetName = state;

    let filter = {};
    let result;
    if (district) filter.district_db = { $regex: district, $options: "i" }
    if (state) filter.state_db = { $regex: state, $options: 'i' };

    if (database === "RAW") {
      result = await rawDataModel.find(filter)
      console.log({ message: "Data found in raw db", totalCount: result.length })
    }
    if (database === "CLIENT") {
      result = await clientModel.find(filter)
      console.log({ message: "Data found in client db", totalCount: result.length })
    }
    if (database === "USER") {
      result = await clientSubscriptionModel.find(filter)
      console.log({ message: "Data found in user db", totalCount: result.length })
    }

    const plainJSON = result.map(doc => doc.toObject()); // i can also used this JSON.parse(JSON.stringify(result)) becoz it convert json string to plain object

    const ws = xlsx.utils.json_to_sheet(plainJSON, { header: Object.keys(plainJSON[0]) });
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, sheetName)
    const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" })

    res.setHeader(
      "Content-Disposition",
      "attachment; filename="+sheetName+".xlsx"
    )
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )

    res.send(buffer)
  } catch (err) {
    console.log("internal error", err)
    res.status(200).json({ message: "internal error", err: err.message })
  }

};
module.exports = { excelDownloadController }