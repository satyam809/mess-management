var Request = require("request");
var Locations = require.main.require("./models/Locations");
async function index(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Locations", { controller: "Location",session_check: req.session });
}
exports.index = index;
async function all(req, res) {
  const result = await Locations.find();
  return res.status(200).json({ data: result });
}
exports.all = all;
async function add(req, res) {
  var errorData = {};

  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Location is required";
  } else {
    //console.log(input.contact_number);
    const existingLocation = await Locations.findOne({
      name: input.name.trim(),
    }).exec();
    //console.log(existingContact);
    if (existingLocation) {
      errorData.name = "Location already exists";
    }
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    const SaveData = new Locations(input);
    var saveResult = await SaveData.save();
    return res.json({
      status: true,
      message: "Location added successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.add = add;
async function deleteRecord(req, res) {
  try {
    const location = await Locations.findByIdAndDelete(req.params.id);

    if (!location) {
      return res.status(404).json({ error: "location not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "location deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the user." });
  }
}
exports.deleteRecord = deleteRecord;
async function get(req, res) {
  try {
    const { id } = req.params;
    const result = await Locations.findById(id);

    if (!result) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error("Error retrieving locations:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving the location." });
  }
}
exports.get = get;
async function edit(req, res) {
  var errorData = {};
  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Location is required";
  } else {
    const existingLocation = await Locations.findOne({
      name: input.name.trim(),
      _id: { $ne: req.params.id }, // Exclude the current document being updated
    }).exec();
    if (existingLocation) {
      errorData.name = "Location already exists";
    }
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    var saveResult = await Locations.findByIdAndUpdate(req.params.id, {
      $set: input,
    });
    return res.json({
      status: true,
      message: "Location updated successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.edit = edit;
