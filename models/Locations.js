const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    name: String,
    is_deleted: String,
    is_active: { type: Number,default:1},
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Locations", UserSchema);
