const mongoose = require("mongoose");


const taskProductMatrixSchema = new mongoose.Schema({
    taskTitle: { type: String, required: true },
    products: [
        {
            productTitle: { type: String, required: true },
            num: { type: Number, default: 0 },
        }
    ]
})
const userFormSchema = new mongoose.Schema({
    assign_task: [{
        title: String,
        num: Number,
        completed: { type: Number, default: 0 }, // Completed count
    }],
    request_task: [{
        title: String,
        num: Number,
        text: String,
        completed: { type: Number, default: 0 },
    }],
    product_task: [{
        title: String,
        min: Number,
        max: Number,
    }],

     // ✅ New field: matrix of tasks × products
    task_product_matrix_db: [taskProductMatrixSchema],

    excelId_db: { title: String, excelId: String },
    assignById_db: { type: String },
    assignToId_db: { type: String },
}, { timestamps: true })

const userFormModel = mongoose.model("userFormModel", userFormSchema);
module.exports = { userFormModel };


  // ✅ new matrix data example
//   task_product_matrix: [
//     {
//       taskTitle: "New Data Add",
//       products: [
//         { productTitle: "Optocare", num: 5 },
//         { productTitle: "Website", num: 2 },
//         { productTitle: "Barcode", num: 0 }
//       ]
//     },
//     {
//       taskTitle: "Leads",
//       products: [
//         { productTitle: "Optocare", num: 1 },
//         { productTitle: "Website", num: 3 },
//         { productTitle: "Barcode", num: 0 }
//       ]
//     }
//   ],