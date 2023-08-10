var Request = require("request");
const mongoose = require("mongoose");
var Students = require.main.require("./models/Students");
var PayHistory = require.main.require("./models/PayHistory");

async function save(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  if (req.method == "POST") {
    var input = JSON.parse(JSON.stringify(req.body));
    if (input.payment == "Cash") {
      const date = new Date();
      const timestamp = date.getTime();
      input.transaction_id = timestamp;
    }
    var checkOtp = await Students.findOne({ _id: input.student_id });
    if (checkOtp.otp == input.otp) {
      const SaveData = new PayHistory(input);
      var saveResult = await SaveData.save();
      var generate_otp = await Students.findOne({ _id: input.student_id });
      return res.status(200).json({
        status: true,
        message: "Payment successfully",
        data: saveResult,
        generate_otp: generate_otp.generate_otp,
      });
    }else{
      return res.status(500).json({
        status: false,
        message: "OTP didn't match",
      });
    }
  }
}
exports.save = save;

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
  var type = req.body.type;
  var option = req.body.option;
  var start_date = req.body.start_date;
  var meal = req.body.meal;

  let totalDiet;
  if (
    option == "6486e7a68ba4078866e2e707" ||
    option == "6486e7bb8ba4078866e2e708"
  ) {
    totalDiet = 64;
  } else if (
    option == "6486e7c88ba4078866e2e709" ||
    option == "6486e7d88ba4078866e2e70a"
  ) {
    totalDiet = 32;
  }
  let currentDiet = 0;
  let isLunch;
  if (meal == "Lunch") {
    isLunch = true;
  } else {
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
  return res.status(200).json({ data: result });
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
