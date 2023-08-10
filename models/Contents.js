const mongoose = require("mongoose");
const UserSchema = mongoose.Schema(
  {
    rules_regulations: String,
    terms_conditions: String,
    created_at: String,
    updated_at: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Contents", UserSchema);
