const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PayHistorySchema = mongoose.Schema({
  student_id: { type: Schema.Types.ObjectId, ref: 'Students', required: true },
  membershipOption_id: { type: Schema.Types.ObjectId, ref: 'MembershipTypeOptions', required: true },
  payment: { type: String, required: true },
  amount: { type: Number},
  transaction_id: { type: String },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("PayHistory", PayHistorySchema);
