var Students = require.main.require("./models/Students");
var ScheduleOffs = require.main.require("./models/ScheduleOffs");
var ScheduleOffDates = require.main.require("./models/ScheduleOffDates");
const controller = "ScheduleOff";
async function index(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  data = {};
  action = "list";
  res.render("admin/schedule_off", {
    page_title: " List",
    controller: controller,
    action: action,
    //module_name: module_name,
    session_check: req.session,
  });
}
exports.index = index;
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
        $unwind: "$student", // Unwind the "student" array created by the previous lookup
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
    ];

    const result = await ScheduleOffs.aggregate(pipeline).exec();

    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.error("An error occurred:", error);
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
}

exports.list = list;
async function status(req, res, next) {
  if (req.body.status == 1) {
    var allDates = await ScheduleOffDates.find({
      scheduleOff_id: req.body.scheduleoff_id,
    });
    if (allDates.length > 0) {
      var endDate = await Students.findOne({ _id: req.body.student_id });
      var calDate = new Date(endDate.end_date);
      calDate.setDate(calDate.getDate() + allDates.length);

      var resultDate = calDate.toISOString().split("T")[0];
      var updateEndDate = await Students.updateOne(
        { _id: req.body.student_id },
        { $set: { end_date: resultDate } }
      );
      if (updateEndDate.nModified > 0) {
        var updateStatus = await ScheduleOffs.updateOne(
          { _id: req.body.scheduleoff_id },
          { status: req.body.status }
        );

        if (updateStatus.nModified > 0) {
          return res
            .status(200)
            .json({ status: true, message: "Status updated successfully" });
        }
      }
    }
  } else {
    var updateStatus = await ScheduleOffs.updateOne(
      { _id: req.body.scheduleoff_id },
      { status: req.body.status }
    );

    if (updateStatus.nModified > 0) {
      return res
        .status(200)
        .json({ status: true, message: "Status updated successfully" });
    }
  }

  return res
    .status(200)
    .json({ status: false, message: "Status update failed" });
}

exports.status = status;
async function getStudent(req, res, next) {
  try {
    const result = await Students.findOne({
      contact_number: req.params.number,
    });
    if (result) {
      return res.status(200).json({ status: true, data: result });
    } else {
      return res
        .status(200)
        .json({ status: false, error: "Enter correct number" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, error: "Internal server error" });
  }
}
exports.getStudent = getStudent;
