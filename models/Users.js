const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    first_name: { type: String, required: true},
    last_name: String,
    email: { type: String, unique: true },
    password: String,
    profile_pic: String,
    contact_number: { type: Number, required: true, unique: true },
    address: String,
    start_date: String,
    start_date_meal: String,
    end_date: String,
    end_date_meal: String,
    role_id: String,
    service: String,
    mess_option: String,
    payment: String,
    location_id: String,
    salary:Number,
    min_request_day: { type: Number},
    is_deleted: String,
    is_active: String,
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", UserSchema);
