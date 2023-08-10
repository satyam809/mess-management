const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ScheduleOffsSchema = mongoose.Schema(
  {
    student_id: { type: Schema.Types.ObjectId,
      ref: "Students" },
    meal_type: { type: Number},
    reason: { type: String},
    status: { type: Number, default: 0 },
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ScheduleOffs", ScheduleOffsSchema);
