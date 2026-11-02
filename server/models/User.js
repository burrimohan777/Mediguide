import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true, 
        minlength: 6 
    },
    preferredLanguage: { 
        type: String, 
        enum: ["en", "hi", "te"], 
        default: "en" 
    },
  },
  { timestamps: true }
);
export default mongoose.model("User", userSchema);