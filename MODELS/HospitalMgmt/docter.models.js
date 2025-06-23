import mongoose from "mongoose";
const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    specialization: {
      type: String,
      required: true,
    },
    experience: {
      type: Number,
      required: true,
      default: 0, // Default experience in years
    },
    contactNumber: {
      type: String,
      required: true,
    },
    worksInHospital: [
      {
        hospital: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Hospital",
          required: true,
        },
        worksHours: {
          type: String,
          required: true, // e.g., "9 AM - 5 PM"
        },
        address: {
          type: String,
          required: true, // Address of the hospital
        },
        city: {
          type: String,
          required: true, // City where the hospital is located
        },
        pincode: {
          type: String,
          required: true, // Pincode of the hospital
        },
        specializedIn: {
          type: String,
          required: true, // Specialization of the doctor in this hospital
        },
      },
    ],
    patients: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
    },
    liscenseNumber: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      default: 0,
    },
    qualifications: {
      type: String, // Array of strings to store multiple qualifications
      required: true,
    },
  },
  { timestamps: true }
);
export const Doctor = mongoose.model("Doctor", doctorSchema);
