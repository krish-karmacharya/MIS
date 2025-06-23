import mongoose from "mongoose";
const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    diagnosisWith: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    bloodGroup: {
      //enum may be added
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    admittedIn: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
  },

  { timestamps: true }
);
export const Patine = mongoose.model("Patient", patientSchema);
