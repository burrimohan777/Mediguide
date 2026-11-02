import mongoose from "mongoose";

const scanSchema = new mongoose.Schema(
    {
        user: {
            type : mongoose.Schema.Types.ObjectId, 
            ref:"User",
            required: true
        },
        imagePath:{
            type:String,
            required:true
        },
        rawText: {
            type: String
        },
        matchedMedicine: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Medicine"
        },
        matchedMedicines: [{
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Medicine"
        }],

        type: {
            type: String,
            enum: ["medicine", "prescription"], default: "medicine"
        },
        batchNumber: { 
            type: String, 
            default: null 
        },
        expiryDate: { 
            type: String, 
            default: null 
        },
        manufacturingDate: { 
            type: String, 
            default: null 
        },
    },
    {timestamps: true}
);

export default mongoose.model("Scan",scanSchema);