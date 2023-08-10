var Request = require("request");
const mongoose = require("mongoose");
//var Categories = require.main.require('./models/Categories');
var Users = require.main.require("./models/Users");
var Students = require.main.require("./models/Students");
var Locations = require.main.require("./models/Locations");
var PayHistory = require.main.require("./models/PayHistory");
const controller = "Students";
const module_name = "Students";
async function list(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  data = {};
  action = "list";
  res.render("admin/Students/list", {
    page_title: " List",
    controller: controller,
    action: action,
    module_name: module_name,
    session_check: req.session,
  });
}
exports.list = list;
async function All_list(req, res) {
  const pipeline = [
    {
      $lookup: {
        from: "membershiptypes", // Adjust the collection name here if needed
        localField: "membershipType_id",
        foreignField: "_id",
        as: "membershipType",
      },
    },
    {
      $lookup: {
        from: "membershiptypeoptions",
        localField: "membershipTypeOption_id",
        foreignField: "_id",
        as: "membershipTypeOption",
      },
    },
  ];

  const result = await Students.aggregate(pipeline).exec();

  //console.log(result);
  return res.status(200).json({ status: true, data: result });
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
  try {
    res.set("content-type", "text/html; charset=mycharset");
    var action = "edit";
    var entityDetail = {};
    var errorData = {};
    const locations = await Locations.find();

    if (req.params.id) {
      var id = req.params.id;
      entityDetail = await Students.findById(id);

      if (!entityDetail) {
        req.flash("error", "Invalid url");
        return res.redirect(nodeAdminUrl + "/Students/list");
      }

      if (req.method == "POST") {
        var input = req.body;

        if (!input.first_name) {
          errorData.first_name = "Name is required";
        }
        if (!input.contact_number) {
          errorData.contact_number = "Phone is required";
        } else {
          const existingContact = await Students.findOne({
            contact_number: input.contact_number,
            _id: { $ne: req.params.id }, // Exclude the current document being updated
          }).exec();
          if (existingContact) {
            errorData.contact_number = "Contact already exists";
          }
        }
        if (!input.address) {
          errorData.address = "Address is required";
        }

        if (!input.start_date) {
          errorData.start_date = "Start Date is required";
        }
        if (!input.end_date) {
          errorData.end_date = "End Date is required";
        }
        if (!input.start_date_meal) {
          errorData.start_date_meal = "This is required";
        }
        if (!input.end_date_meal) {
          errorData.end_date_meal = "This is required";
        }
        if (!input.payment) {
          errorData.payment = "This is required";
        }
        if (!input.location_id) {
          errorData.location_id = "This is required";
        }
        if (Object.keys(errorData).length === 0) {
          // Upload Image
          if (req.files && req.files.profile_pic !== undefined) {
            let profile_pic = req.files.profile_pic;
            var timestamp = new Date().getTime();
            filename = timestamp + "-" + profile_pic.name;
            input.profile_pic = filename;
            profile_pic.mv("public/upload/" + filename, function (err) {
              if (err) {
                req.flash("error", "Could not upload image. Please try again!");
                res.locals.message = req.flash();
                return res.redirect(nodeAdminUrl + "/Students/" + action);
              }
            });
          }

          var msg = controller + " updated successfully.";
          console.log(req.params.id);
          console.log(input);
          var saveResult = await Students.findByIdAndUpdate(req.params.id, {
            $set: input,
          });
         
          req.flash("success", msg);
          res.locals.message = req.flash();

          if (saveResult) {
            console.log(saveResult);
            if (
              saveResult.payment == "Cash" &&
              saveResult.start_date != "" &&
              saveResult.end_date != "" &&
              input.amount != ""
            ) {
              const paymentHistory = new PayHistory({
                student_id: saveResult._id,
                payment: saveResult.payment,
                amount: input.amount,
                membershipOption_id: input.membershipTypeOption_id,
              });
              try {
                await paymentHistory.save();
              } catch (error) {
                console.error("Error saving payment history:", error);
                // Handle the error as required
              }
            }
            return res.redirect(nodeAdminUrl + "/" + controller + "/list");
          }
        }
      }

      res.render("admin/" + controller + "/edit", {
        page_title: "Edit",
        data: entityDetail,
        errorData: errorData,
        controller: controller,
        action: action,
        All_locations: locations,
        session_check: req.session,
      });
    } else {
      req.flash("error", "Invalid url.");
      return res.redirect(nodeAdminUrl + "/" + controller + "/list");
    }
  } catch (error) {
    console.error(error);
    // Handle the error here
    // You can redirect to an error page or send an error response
    // Example:
    res.status(500).send("Internal Server Error");
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
    // console.log(input);

    // Validate input data
    if (!input.first_name) {
      errorData.first_name = "Name is required";
    }
    if (!input.contact_number) {
      errorData.contact_number = "Phone is required";
    } else {
      //console.log(input.contact_number);
      const existingContact = await Students.findOne({
        contact_number: input.contact_number.trim(),
      }).exec();
      //console.log(existingContact);
      if (existingContact) {
        errorData.contact_number = "Contact already exists";
      }
    }
    if (!input.address) {
      errorData.address = "Address is required";
    }
    if (!input.start_date) {
      errorData.start_date = "Start Date is required";
    }
    if (!input.end_date) {
      errorData.end_date = "End Date is required";
    }
    if (!input.start_date_meal) {
      errorData.start_date_meal = "This is required";
    }
    if (!input.end_date_meal) {
      errorData.end_date_meal = "This is required";
    }
    if (!input.payment) {
      errorData.payment = "This is required";
    }
    if (!input.location_id) {
      errorData.location_id = "This is required";
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
            //console.log(err);
            req.flash("error", "Could not upload image. Please try again!");
            res.locals.message = req.flash();
            return res.redirect(nodeAdminUrl + "/Students/add");
          }
        });
      }
      const SaveData = new Students(input);
      var saveResult = await SaveData.save();
      if (saveResult) {
        if (
          saveResult.payment == "Cash" &&
          saveResult.start_date != "" &&
          saveResult.end_date != "" &&
          input.amount != ""
        ) {
          const paymentHistory = new PayHistory({
            student_id: saveResult._id,
            payment: saveResult.payment,
            amount: input.amount,
            membershipOption_id: input.membershipTypeOption_id,
          });
          try {
            await paymentHistory.save();
          } catch (error) {
            console.error("Error saving payment history:", error);
            // Handle the error as required
          }
        }
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
          session_check: req.session,
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
        session_check: req.session,
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
      session_check: req.session,
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
  var studentDetail = {};
  if (req.params.id) {
    studentDetail = await Students.findByIdAndRemove(req.params.id);
    payHistoryDelete = await PayHistory.deleteMany({
      student_id: req.params.id,
    });
    if (studentDetail && payHistoryDelete) {
      res
        .status(200)
        .json({ status: true, message: "Student deleted successfully" });
    } else {
      res.status(500).json({ status: false, message: "Error" });
    }
  } else {
    res.status(500).json({ status: false, message: "Invalid" });
  }
}
exports.deleteRecord = deleteRecord;
async function payment_history(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Students/payment-history", {
    controller: controller,
    session_check: req.session,
  });
}
exports.payment_history = payment_history;
async function get_payment_history(req, res) {
  const studentId = mongoose.Types.ObjectId(req.params.id);
  const pipeline = [
    {
      $match: { student_id: studentId },
    },
    {
      $lookup: {
        from: "students", // Adjust the collection name here if needed
        localField: "student_id",
        foreignField: "_id",
        as: "student",
      },
    },
    // {
    //   $project: {
    //     student_id: 1,
    //     payment: 1,
    //     "student.first_name": 1
    //   },
    // },
  ];

  const result = await PayHistory.aggregate(pipeline).exec();
  //console.log(result);
  return res.status(200).json({ status: true, data: result });
}

exports.get_payment_history = get_payment_history;
async function check_expiry(req, res) {
  const currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = currentDate.getMonth() + 1; // Add 1 to get the month from 1 to 12 (January is 0)
  var day = currentDate.getDate();

  // Format the date as "YYYY-MM-DD"
  var formattedDate =
    year +
    "-" +
    day.toString().padStart(2, "0") +
    "-" +
    month.toString().padStart(2, "0");

  //console.log(formattedDate);
  if (req.body.check == 1) {
    var result = await Students.find({ end_date: { $lt: formattedDate } });
  } else if (req.body.check == 2) {
    var result = await Students.find({ end_date: { $gt: formattedDate } });
  } else if (req.body.check == 0) {
    if (req.session.LoginUser.role_id == "1") {
      var result = await Students.find({
        user_id: req.session.LoginUser._id,
      });
    } else {
      var result = await Students.find();
    }
  }
  return res.status(200).json({ data: result });
}
exports.check_expiry = check_expiry;
async function endDate(req, res, next) {
  var option = req.body.option;
  var start_date = req.body.start_date;
  var meal = req.body.meal;
  let currentDiet = 0;
  let isLunch;
  let totalDiet;
  if (
    option == "6486e7a68ba4078866e2e707" ||
    option == "6486e7bb8ba4078866e2e708"
  ) {
    totalDiet = 64;
    if (meal == "Lunch") {
      isLunch = true;
    } else {
      isLunch = false;
    }
  } else if (
    option == "6486e7c88ba4078866e2e709" ||
    option == "6486e7d88ba4078866e2e70a"
  ) {
    totalDiet = 32;
    if (meal == "Lunch") {
      isLunch = true;
    } else {
      isLunch = false;
    }
  } else if (
    option == "6486e7e98ba4078866e2e70b" ||
    option == "6486e7ff8ba4078866e2e70c"
  ) {
    totalDiet = 33;
    isLunch = true;
  } else if (option == "6486e8178ba4078866e2e70d") {
    totalDiet = 32;
    isLunch = false;
  }

  const startDate = new Date(start_date);
  var result = iterateTwoMonths(
    currentDiet,
    startDate,
    isLunch,
    totalDiet,
    option
  );
  return res.status(200).json({ status: true, data: result });
}
exports.endDate = endDate;

function iterateTwoMonths(currentDiet, startDate, isLunch, totalDiet, option) {
  const currentDate = new Date(startDate);
  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0
  );
  const loopDates = [];
  while (currentDate <= endDate) {
    loopDates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (let i = 0; i < loopDates.length; i++) {
    const date = loopDates[i];
    const formattedDate = formatDate(date);
    if (date.getDate() == 15 || date.getDate() == 30) {
      currentDiet = currentDiet + 1;
    } else {
      if (isLunch) {
        currentDiet = currentDiet + 2;
      } else {
        isLunch = true;
        currentDiet = currentDiet + 1;
      }
    }
    if (currentDiet == totalDiet || currentDiet == totalDiet - 1) {
      if (
        option == "6486e7a68ba4078866e2e707" ||
        option == "6486e7bb8ba4078866e2e708" ||
        option == "6486e7c88ba4078866e2e709" ||
        option == "6486e7d88ba4078866e2e70a"
      ) {
        if (currentDiet == totalDiet - 1) {
          const date1 = new Date(formattedDate);
          date1.setDate(date1.getDate() + 1);
          //console.log("Finish Lunch = " + formatDate(date1));
          var result = {};
          result.meal = "Lunch";
          result.endDate = formatDate(date1);
          return result;
        } else {
          //console.log("Finish Dinner = " + formattedDate);
          var result = {};
          result.meal = "Dinner";
          result.endDate = formattedDate;
          return result;
        }
      }
    }
  }
  // Perform additional operations with each date
  return null; // Return null if no matching result is found
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
async function generate_otp_page(req, res, next) {
  res.set("content-type", "text/html; charset=mycharset");
  res.render("admin/Generate_otp", {
    page_title: " List",
    controller: controller,
    action: "Generate OTP",
    module_name: module_name,
    session_check: req.session,
  });
}
exports.generate_otp_page = generate_otp_page;
async function generate_otp(req, res, next) {
  if (req.method === "POST") {
    try {
      const input = req.body;
      const contact = await Students.findOne({
        contact_number: input.contact_number,
      });

      if (contact) {
        const otp = Math.floor(100000 + Math.random() * 9000);
        const updateData = await Students.updateOne(
          { contact_number: input.contact_number },
          { $set: { otp: otp } }
        );

        if (updateData.nModified > 0) {
          const updatedStudent = await Students.findOne({
            contact_number: input.contact_number,
          });

          res.status(200).json({
            status: true,
            data: updatedStudent,
          });
        } else {
          res.status(200).json({
            status: false,
            error: "Failed to update OTP",
          });
        }
      } else {
        res.status(200).json({
          status: false,
          error: "Insert correct contact number",
        });
      }
    } catch (error) {
      console.error("An error occurred:", error);
      res.status(200).json({ status: false, error: "Internal server error" });
    }
  }
}

exports.generate_otp = generate_otp;
async function get(req, res, next) {
  try {
    console.log(req.params.id);
    const pipeline = [
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.params.id),
        },
      },
      {
        $lookup: {
          from: "payhistories", // Adjust the collection name here if needed
          localField: "_id",
          foreignField: "student_id",
          as: "payHistory",
        },
      },
    ];

    const result = await Students.aggregate(pipeline).exec();
    res.status(200).json({
      status: true,
      data: result[0],
    });
  } catch (error) {
    // Handle the error
    console.error(error);
    res.status(500).json({
      status: false,
      message: "An error occurred while retrieving data.",
    });
  }
}

exports.get = get;
