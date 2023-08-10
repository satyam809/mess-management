const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ScheduleOffDatesSchema = mongoose.Schema(
  {
    scheduleOff_id: { type: Schema.Types.ObjectId,
      ref: "ScheduleOffs", },
    student_id: { type: Schema.Types.ObjectId,
        ref: "Students", },
    date: { type: String},
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ScheduleOffDates", ScheduleOffDatesSchema);
