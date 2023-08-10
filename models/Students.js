const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const StudentSchema = mongoose.Schema(
  {
    user_id: { type: Schema.Types.ObjectId,
      ref: "Users", },
    first_name: { type: String, required: true },
    last_name: { type: String},
    profile_pic: String,
    contact_number: { type: Number, required: true, unique: true },
    address: String,
    start_date: String,
    start_date_meal: String,
    end_date: String,
    end_date_meal: String,
    validity: String,
    validity_meal: String,
    membershipType_id: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTypes",
      required: true,
    },
    membershipTypeOption_id: {
      type: Schema.Types.ObjectId,
      ref: "MembershipTypeOptions",
    },
    payment: String,
    payment_status: { type: Number,default:0},
    location_id: {
      type: Schema.Types.ObjectId,
      ref: "Locations"
    },
    remark: String,
    qr_code: String,
    password: String,
    otp: { type: Number },
    device_token: { type: String},
    is_login: { type: Number,default:0},
    is_deleted: String,
    is_active: { type: Number,default:1},
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Students", StudentSchema);
