var Request = require("request");
const mongoose = require("mongoose");
var types = require.main.require("./models/MembershipTypes");
var options = require.main.require("./models/MembershipTypeOptions");
const controller = "Memberships";
const module_name = "Memberships";
async function typesIndex(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Memberships/types", {
    controller: controller,
    action: "types",
    session_check: req.session,
  });
}
exports.typesIndex = typesIndex;
async function optionsIndex(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Memberships/options", {
    controller: controller,
    action: "options",
    session_check: req.session,
  });
}
exports.optionsIndex = optionsIndex;
async function options_list(req, res) {
  const pipeline = [
    {
      $lookup: {
        from: "membershiptypes", // Adjust the collection name here if needed
        localField: "membershipType_id",
        foreignField: "_id",
        as: "type",
      },
    },
  ];

  const result = await options.aggregate(pipeline).exec();
  console.log(result);
  return res.status(200).json({ status: true, data: result });
}
exports.options_list = options_list;
async function types_list(req, res) {
  const result = await types.find();
  return res.status(200).json({ data: result });
}
exports.types_list = types_list;
async function get(req, res) {
  try {
    const { id } = req.params;
    const result = await types.findById(id);

    if (!result) {
      return res.status(404).json({ error: "not found" });
    }

    res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error("Error retrieving:", error);
    res.status(500).json({ error: "An error occurred while retrieving." });
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
    const existingLocation = await types
      .findOne({
        name: input.name.trim(),
        _id: { $ne: req.params.id }, // Exclude the current document being updated
      })
      .exec();
    if (existingLocation) {
      errorData.name = "Memberships types already exists";
    }
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    var saveResult = await Locations.findByIdAndUpdate(req.params.id, {
      $set: input,
    });
    return res.json({
      status: true,
      message: "Memberships types updated successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.edit = edit;
async function addOption(req, res) {
  var errorData = {};

  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Option is required";
  }
  if (input.membershipType_id == "") {
    errorData.membershipType_id = "Membership Type is required";
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    const SaveData = new options(input);
    var saveResult = await SaveData.save();
    return res.json({
      status: true,
      data: saveResult,
      message: "Membership option added successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.addOption = addOption;
async function addType(req, res) {
  var errorData = {};

  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Membership Type is required";
  } else {
    //console.log(input.contact_number);
    const existing = await types
      .findOne({
        name: input.name.trim(),
      })
      .exec();
    //console.log(existingContact);
    if (existing) {
      errorData.name = "This name is already exists";
    }
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    const SaveData = new types(input);
    var saveResult = await SaveData.save();
    return res.json({
      status: true,
      message: "Membership type added successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.addType = addType;
async function deleteType(req, res) {
  //console.log("testing delete");
  try {
    const result = await types.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ error: "Membership type not found" });
    }

    res
      .status(200)
      .json({ status: true, message: "Membership type deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "An error occurred while deleting." });
  }
}
exports.deleteType = deleteType;
async function getType(req, res) {
  const { id } = req.params;
  const result = await types.findById(id);
  res.status(200).json({ status: true, data: result });
}
exports.getType = getType;
async function editType(req, res) {
  var errorData = {};
  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Membership type is required";
  } else {
    const existing = await types
      .findOne({
        name: input.name.trim(),
        _id: { $ne: req.params.id }, // Exclude the current document being updated
      })
      .exec();
    if (existing) {
      errorData.name = "This is already exists";
    }
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    var saveResult = await types.findByIdAndUpdate(req.params.id, {
      $set: input,
    });
    return res.json({
      status: true,
      message: "Membership type updated successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.editType = editType;
async function getOption(req, res) {
  const { id } = req.params;
  const result = await options.findById(id);
  res.status(200).json({ status: true, data: result });
}
exports.getOption = getOption;
async function updateOption(req, res) {
  var errorData = {};
  var input = JSON.parse(JSON.stringify(req.body));

  // Validate input data
  if (!input.name) {
    errorData.name = "Membership option is required";
  }
  if (input.membershipType_id == null) {
    errorData.membershipType_id = "Membership type is required";
  }

  // Handle validation errors
  if (Object.keys(errorData).length === 0) {
    var saveResult = await options.findByIdAndUpdate(req.params.id, {
      $set: input,
    });
    return res.json({
      status: true,
      message: "Memberships option updated successfully",
    });
  } else {
    return res.json({ status: false, error: errorData });
  }
}
exports.updateOption = updateOption;
async function deleteOption(req, res, next) {
  const result = await options.findByIdAndDelete(req.params.id);

  if (result) {
    return res
      .status(200)
      .json({
        status: true,
        message: "Membership option deleted successfully",
      });
  }
}
exports.deleteOption = deleteOption;
