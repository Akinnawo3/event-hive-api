import mongoose from "mongoose";

const VerificationTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    usage: {
      type: String,
      enum: ["signup", "forgot password"],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Token", VerificationTokenSchema);
