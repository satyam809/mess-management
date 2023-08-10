const mongoose = require("mongoose");
const MembershipTypeSchema = mongoose.Schema(
  {
    name: { type: String, required: true, unique: true},
    status: Number,
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MembershipTypes", MembershipTypeSchema);
