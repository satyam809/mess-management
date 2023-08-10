var Users = require.main.require("./models/Users");
async function index(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  //console.log(req.session);
  var result = await Users.findOne({_id:req.session.LoginUser._id});
  console.log(result);
  res.render("admin/Setting", {
    controller: "Setting",
    session_check: req.session,
    result: result
  });
}
exports.index = index;
async function edit(req, res, next) {
  try {
    const errorData = {};
    const input = req.body;
    console.log(input.first_name);
    // Validate input data
    if (!input.first_name) {
      errorData.first_name = "Name is required";
    }

    if (!input.email) {
      errorData.email = "Email is required";
    } 
    // else {
    //   const existingEmail = await Users.findOne({
    //     email: input.email.trim(),
    //   }).exec();

    //   if (existingEmail) {
    //     errorData.email = "Email already exists";
    //   }
    // }

    if (!input.contact_number) {
      errorData.contact_number = "Contact Number is required";
    } 
    // else {
    //   const existingContact = await Users.findOne({
    //     contact_number: input.contact_number,
    //   }).exec();

    //   if (existingContact) {
    //     errorData.contact_number = "This number already exists";
    //   }
    // }

    // Handle validation errors
    if (Object.keys(errorData).length === 0) {
      await Users.findByIdAndUpdate(input.user_id, { $set: input });

      return res.json({
        status: true,
        message: "Updated successfully",
      });
    } else {
      return res.json({
        status: false,
        error: errorData,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "An error occurred",
    });
  }
}
exports.edit = edit;
