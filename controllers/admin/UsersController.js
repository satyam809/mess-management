var Request = require("request");
//var Categories = require.main.require('./models/Categories');
var Users = require.main.require("./models/Users");
var Locations = require.main.require("./models/Locations");
const controller = "Users";
const module_name = "Users";
const bcrypt = require("bcrypt");
const saltRounds = 10;
const myPlaintextPassword = "s0//P4$$w0rD";
const someOtherPlaintextPassword = "not_bacon";

/**
 *  list
 *  Purpose: This function is used to show listing of all arecord
 *  Pre-condition:  None
 *  Post-condition: None.
 *  Parameters: ,
 *  Returns: json
 */
async function list(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  action = "list";
  //const allRecord = await Users.findAll();
  res.render("admin/Users/list", {
    page_title: " List",
    controller: controller,
    action: action,
    module_name: module_name,
    session_check: req.session
  });
}
exports.list = list;
async function All_list(req, res) {
  const allRecord = await Users.find({ role_id: 1 });
  return res.status(200).json({ data: allRecord });
}
exports.All_list = All_list;

/**
 *  Edit
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None.
 *  Parameters: ,
 *  Returns: json
 */
async function edit(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  var action = "edit";
  var entityDetail = {};
  var errorData = {};
  const locations = await Locations.find();
  if (req.params.id) {
    var id = req.params.id;
    const entityDetail = await Users.findById({ _id: id });
    if (entityDetail == 0) {
      req.flash("error", "Invalid url");
      return res.redirect(nodeAdminUrl + "/Users/list");
    }
    if (req.method == "POST") {
      var input = JSON.parse(JSON.stringify(req.body));
      if (!input.first_name) {
        errorData.first_name = "Name is required";
      }
      if (!input.email) {
        errorData.email = "Email is required";
      } else {
        const existingEmail = await Users.findOne({
          email: input.email.trim(),
          _id: { $ne: req.params.id }, // Exclude the current document being updated
        }).exec();
        if (existingEmail) {
          errorData.email = "Email already exists";
        }
      }
      if (!input.contact_number) {
        errorData.contact_number = "Phone is required";
      } else {
        const existingContact = await Users.findOne({
          contact_number: input.contact_number.trim(),
          _id: { $ne: req.params.id }, // Exclude the current document being updated
        }).exec();
        if (existingContact) {
          errorData.contact_number = "Contact already exists";
        }
      }
      if (Object.keys(errorData).length === 0) {
        var saveResult = "";
        // Upload Image
        if (req.files && req.files.profile_pic !== "undefined") {
          let profile_pic = req.files.profile_pic;
          var timestamp = new Date().getTime();
          filename = timestamp + "-" + profile_pic.name;
          input.profile_pic = filename;
          profile_pic.mv("public/upload/" + filename, function (err) {
            if (err) {
              console.log(err);
              req.flash("error", "Could not upload image. Please try again!");
              res.locals.message = req.flash();
              return res.redirect(nodeAdminUrl + "/Users/" + action);
            }
          });
        }
        var msg = controller + " updated successfully.";
        var salt = bcrypt.genSaltSync(saltRounds);
        var password = bcrypt.hashSync(input.password, salt);
        input.password = password;
        var saveResult = await Users.findByIdAndUpdate(req.params.id, {
          $set: input,
        });
        req.flash("success", msg);
        res.locals.message = req.flash();
        if (saveResult) {
          return res.redirect(nodeAdminUrl + "/" + controller + "/list");
        }
      }
    }
    res.render("admin/" + controller + "/edit", {
      page_title: " Edit",
      data: entityDetail,
      errorData: errorData,
      controller: controller,
      action: action,
      All_locations: locations,
      session_check: req.session
    });
  } else {
    req.flash("error", "Invalid url.");
    return res.redirect(nodeAdminUrl + "/" + controller + "/list");
  }
}
exports.edit = edit;

/**
 *  Edit
 *  Purpose: This function is used to get constructor List
 *  Pre-condition:  None
 *  Post-condition: None.
 *  Parameters: ,
 *  Returns: json
 */
async function add(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  var page_title = "Add";
  var errorData = {};
  var data = {};
  var action = "add";
  const locations = await Locations.find();
  //console.log(locations);
  if (req.method == "POST") {
    var input = JSON.parse(JSON.stringify(req.body));

    // Validate input data
    if (!input.first_name) {
      errorData.first_name = "Name is required";
    }
    if (!input.email) {
      errorData.email = "Email is required";
    } else {
      const existingEmail = await Users.findOne({
        email: input.email.trim(),
      }).exec();
      if (existingEmail) {
        errorData.email = "Email already exists";
      }
    }
    if (!input.contact_number) {
      errorData.contact_number = "Phone is required";
    } else {
      const existingContact = await Users.findOne({
        contact_number: input.contact_number.trim(),
      }).exec();
      if (existingContact) {
        errorData.contact_number = "Contact already exists";
      }
    }

    // Handle validation errors
    if (Object.keys(errorData).length === 0) {
      if (req.files && req.files.profile_pic !== "undefined") {
        let profile_pic = req.files.profile_pic;
        var timestamp = new Date().getTime();
        var imagePath = "";
        filename = timestamp + "-" + profile_pic.name;
        input.profile_pic = filename;
        profile_pic.mv("public/upload/" + filename, function (err) {
          if (err) {
            console.log(err);
            req.flash("error", "Could not upload image. Please try again!");
            res.locals.message = req.flash();
            return res.redirect(nodeAdminUrl + "/Students/add");
          }
        });
      }
      var salt = bcrypt.genSaltSync(saltRounds);
      var password = bcrypt.hashSync(input.password, salt);
      input.password = password;
      const SaveData = new Users(input);
      var saveResult = await SaveData.save();
      if (saveResult) {
        req.flash("success", controller + " added successfully.");
        res.locals.message = req.flash();
        res.redirect(nodeAdminUrl + "/" + controller + "/list");
      } else {
        req.flash("error", "Could not save record. Please try again");
        res.locals.message = req.flash();
        res.render("admin/" + controller + "/add", {
          page_title: page_title,
          data: data,
          errorData: errorData,
          controller: controller,
          action: action,
          All_locations: locations,
        });
      }
    } else {
      res.render("admin/" + controller + "/add", {
        page_title: page_title,
        data: data,
        errorData: errorData,
        controller: controller,
        action: action,
        All_locations: locations,
        session_check: req.session
      });
    }
  } else {
    res.render("admin/" + controller + "/add", {
      page_title: page_title,
      data: data,
      errorData: errorData,
      controller: controller,
      action: action,
      All_locations: locations,
      session_check: req.session
    });
  }
}

exports.add = add;

/**
 *  delete
 *  Purpose: This function is used to get constructor delete
 *  Pre-condition:  None
 *  Post-condition: None.
 *  Parameters: ,
 *  Returns: json
 */
async function deleteRecord(req, res) {
  var categoryDetail = {};
  if (req.params.id) {
    categoryDetail = await Users.findByIdAndRemove(req.params.id);
    if (categoryDetail) {
      res
      .status(200)
      .json({ status: true, message: "User deleted successfully" });
    }
  } else {
    res
    .status(500)
    .json({ status: false, message: "Invalid" });
  }
}
exports.deleteRecord = deleteRecord;
