import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true, index: true },
  genericName: String,
  composition: String,
  manufacturer: String,
  uses: [String],
  warnings: [String],
  sideEffects: [String],
  
  dose: String,          
  frequency: String,    
  duration: String,      
  instructions: String,  
});

medicineSchema.index({ name: "text", genericName: "text" });

export default mongoose.model("Medicine", medicineSchema);