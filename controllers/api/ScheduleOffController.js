const mongoose = require("mongoose");
var Students = require.main.require("./models/Students");
var Users = require.main.require("./models/Users");
var ScheduleOffs = require.main.require("./models/ScheduleOffs");
var ScheduleOffDates = require.main.require("./models/ScheduleOffDates");
async function save(req, res) {
  try {
    const input = req.body;
    var admin = await Users.findOne({ role_id: "0" });
    var currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + admin.min_request_day);
    const offDate = input.date.split(",");
    const newOffDate = [];
    for (var i = 0; i < offDate.length; i++) {
      var trimmedDate = offDate[i].trim();
      if (new Date(trimmedDate) < currentDate) {
        newOffDate.push(trimmedDate);
      } else {
        return res.status(200).json({
          status: true,
          message: `Some dates are greater than or equal to current date`,
        });
      }
    }
    const saveScheduleOff = new ScheduleOffs(input);
    const scheduleOffResult = await saveScheduleOff.save();

    if (scheduleOffResult) {
      for (var i = 0; i < newOffDate.length; i++) {
        var newDate = newOffDate[i];
        var checkOffDate = await ScheduleOffDates.findOne({
          student_id: scheduleOffResult.student_id,
          date: newDate,
        });
        if (!checkOffDate) {
          await ScheduleOffDates.create({
            scheduleOff_id: scheduleOffResult._id,
            student_id: scheduleOffResult.student_id,
            date: newDate,
          });
        }
      }

      return res.status(200).json({
        status: true,
        message: "Requested schedule saved successfully",
        data: scheduleOffResult,
      });
    } else {
      return res.status(500).json({
        status: false,
        message: "Error occurred while saving schedule",
      });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

exports.save = save;
async function status(req, res, next) {
  res.status(200).json({
    status: true,
    data: await ScheduleOffs.findOne({ _id: req.params.id }),
  });
}
exports.status = status;
async function list(req, res) {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "students",
          localField: "student_id",
          foreignField: "_id",
          as: "student",
        },
      },
      {
        $unwind: "$student",
      },
      {
        $lookup: {
          from: "membershiptypes",
          localField: "student.membershipType_id",
          foreignField: "_id",
          as: "membershipType",
        },
      },
      {
        $lookup: {
          from: "membershiptypeoptions",
          localField: "student.membershipTypeOption_id",
          foreignField: "_id",
          as: "membershipTypeOption",
        },
      },
      {
        $lookup: {
          from: "scheduleoffdates",
          localField: "_id",
          foreignField: "scheduleOff_id",
          as: "scheduleOffDate",
        },
      },
      {
        $match: {
          student_id: mongoose.Types.ObjectId(req.params.id),
        },
      },
    ];

    const result = await ScheduleOffs.aggregate(pipeline).exec();

    return res
      .status(200)
      .json({ status: true, data: result, message: "All schedule off" });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

exports.list = list;
