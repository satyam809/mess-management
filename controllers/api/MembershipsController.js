var Request = require("request");
const mongoose = require("mongoose");
var types = require.main.require("./models/MembershipTypes");
var options = require.main.require("./models/MembershipTypeOptions");
const controller = "Memberships";
const module_name = "Memberships";

async function membershipTypes(req, res) {
  const result = await types.find({status: 1});
  return res.status(200).json({ data: result });
}
exports.membershipTypes = membershipTypes;
async function getOptions(req, res) {
  try {
    const { id } = req.params;
    const result = await options.find({membershipType_id:id,status:1});

    if (!result) {
      return res.status(404).json({ error: "not found" });
    }

    res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error("Error retrieving:", error);
    res.status(500).json({ error: "An error occurred while retrieving." });
  }
}

exports.getOptions = getOptions;
