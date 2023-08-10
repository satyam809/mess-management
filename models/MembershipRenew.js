const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MembershipRenewSchema = mongoose.Schema(
  {
    student_id: { type: Schema.Types.ObjectId, ref: "Students" },
    membershipType_id: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTypes",
      required: true,
    },
    membershipTypeOption_id: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTypeOptions",
    },
    start_date: String,
    start_date_meal: String,
    end_date: String,
    end_date_meal: String,
    isActive: Number,
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("MembershipRenew", MembershipRenewSchema);
