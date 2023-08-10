var Request = require("request");
var Contents = require.main.require("./models/Contents");
async function index(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Contents", { controller: "content",session_check: req.session });
}
exports.index = index;
// async function all(req, res) {
//   const result = await Locations.find();
//   return res.status(200).json({ data: result });
// }
// exports.all = all;
async function edit(req, res) {
  try {
    var input = JSON.parse(JSON.stringify(req.body));
      var saveResult = await Contents.findByIdAndUpdate(req.params.id,{
        $set: input,
      });

      return res.status(200).json({
        status: true,
        message: "Content updated successfully",
        data:input.rules_regulations
      });
  
  } catch (error) {
    console.error(error); // Print the error to the console for debugging

    return res.status(500).json({
      status: false,
      message: "An error occurred while saving the data",
      error: error.message, // Include the error message in the response
    });
  }
}

exports.edit = edit;
// async function deleteRecord(req, res) {
//   try {
//     const location = await Locations.findByIdAndDelete(req.params.id);

//     if (!location) {
//       return res.status(404).json({ error: "location not found" });
//     }

//     res
//       .status(200)
//       .json({ status: true, message: "location deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting user:", error);
//     res
//       .status(500)
//       .json({ error: "An error occurred while deleting the user." });
//   }
// }
// exports.deleteRecord = deleteRecord;
async function get(req, res) {
  try {
    const result = await Contents.find();

    if (!result) {
      return res.status(404).json({ error: "Content not found" });
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
async function test(req, res){
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/test");
}
exports.test = test;
// async function edit(req, res) {
//   var errorData = {};
//   var input = JSON.parse(JSON.stringify(req.body));

//   // Validate input data
//   if (!input.name) {
//     errorData.name = "Location is required";
//   } else {
//     const existingLocation = await Locations.findOne({
//       name: input.name.trim(),
//       _id: { $ne: req.params.id }, // Exclude the current document being updated
//     }).exec();
//     if (existingLocation) {
//       errorData.name = "Location already exists";
//     }
//   }

//   // Handle validation errors
//   if (Object.keys(errorData).length === 0) {
//     var saveResult = await Locations.findByIdAndUpdate(req.params.id, {
//       $set: input,
//     });
//     return res.json({
//       status: true,
//       message: "Location updated successfully",
//     });
//   } else {
//     return res.json({ status: false, error: errorData });
//   }
// }

// exports.edit = edit;
