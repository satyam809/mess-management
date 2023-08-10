const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MembershipTypeOptionSchema = mongoose.Schema({
  membershipType_id: { type: Schema.Types.ObjectId, ref: 'MembershipTypes', required: true },
  name: { type: String, required: true },
  amount: { type: Number},
  status: { type: Number},
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MembershipTypeOptions", MembershipTypeOptionSchema);
