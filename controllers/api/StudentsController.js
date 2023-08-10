const axios = require("axios");
const download = require("image-downloader");
const fs = require("fs");
const mongoose = require("mongoose");
var Students = require.main.require("./models/Students");
var membershipTypeOption = require.main.require("./models/MembershipTypeOptions");
const FCM = require("fcm-node");

async function registration(req, res) {
  res.set("content-type", "text/html; charset=mycharset");
  var errorData = {};
  if (req.method === "POST") {
    var input = req.body; // No need for JSON.parse and JSON.stringify
    var findStudent = await Students.findOne({
      contact_number: input.contact_number,
    });
    if (!findStudent) {
      // Validate input data
      if (!input.first_name) {
        errorData.first_name = "Name is required";
      }
      if (!input.contact_number) {
        errorData.contact_number = "Phone is required";
      }
      if (!input.address) {
        errorData.address = "Address is required";
      }
      if (!input.membershipType_id) {
        errorData.membershipType_id = "Membership type is required"; // Corrected property name
      }

      // Handle validation errors
      if (Object.keys(errorData).length === 0) {
        if (req.files && req.files.profile_pic) {
          // Remove unnecessary check for "undefined"
          let profile_pic = req.files.profile_pic;
          var timestamp = new Date().getTime();
          var filename = timestamp + "-" + profile_pic.name;
          input.profile_pic = filename;
          await profile_pic.mv("public/upload/" + filename); // Use await to ensure file upload completes before continuing
        }
        input.password = input.first_name.charAt(0) + input.contact_number.substring(input.contact_number.length - 4);
        console.log("pass" + input.password);
        const SaveData = new Students(input);
        var saveResult = await SaveData.save();
        if (saveResult) {
          var qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${saveResult._id}`;
          var filePath = `/var/www/html/projects/unclejimess/public/qrcode/${saveResult._id}.png`;
          downloadFile(qrCodeUrl, filePath)
            .then(() => {
              console.log("File downloaded successfully");
            })
            .catch((error) => {
              console.error("Error:", error);
            });
          var saveQrcode = await Students.findByIdAndUpdate(saveResult._id, {
            qr_code: `${saveResult._id}.png`,
          });

          res.status(200).json({
            status: true,
            data: await Students.findOne({ _id: saveResult._id }),
            message: "Student registered successfully",
          });
        } else {
          res.status(500).json({
            status: false,
            error: "Student not registered successfully",
          });
        }
      } else {
        res.status(400).json({
          status: false,
          error: errorData,
        });
      }
    } else if (!findStudent.payment) {
      res.status(200).json({
        status: true,
        message: "Your payment is not done",
        data: findStudent,
      });
    } else {
      res.status(200).json({
        status: true,
        message: "You have already registered",
        data: findStudent,
      });
    }
  }
}

exports.registration = registration;

async function login(req, res) {
  var result = await Students.findOne({
    contact_number: req.body.contact_number,
    password: req.body.password,
  });
  if (result) {
    var updateResult = await Students.findByIdAndUpdate(result._id, {
      is_login: 1,
    });
    if (updateResult) {
      res.status(200).json({
        status: true,
        data: result,
      });
    }
  }else{
    res.status(500).json({
      status: false,
      data: "Please enter correct contact number and OTP",
    });
  }
}
exports.login = login;
async function logout(req, res, next) {
  var updateResult = await Students.findByIdAndUpdate(req.params.id, {
    is_login: 0,
  });
  if (updateResult) {
    res.status(200).json({
      status: true,
      data: await Students.find({ _id: req.params.id }),
      message: "Logout successfully",
    });
  }
}
exports.logout = logout;
async function sendNotification(req, res) {
  // quesry who user expire after 5 days
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 5);
  var result = await Students.find({
    end_date: { $lte: currentDate },
    is_active: 1,
  });
  const registrationToken = [];
  for (var i = 0; i < result.length; i++) {
    if (result[i].device_token) {
      registrationToken.push(
        `ff4-MzWsSnGm-v-6gdzJEe:${result[i].device_token}`
      );
    }
  }
  // const registrationToken = [
  //   "ff4-MzWsSnGm-v-6gdzJEe:APA91bE-BIzhFQKJ8NluXP6M8ufXrssJCJOBfJlkFJAlBVmEz8FmdQ-qHKR6n2OgMYGKp_jUzgbgfTmN6k5ZST0F5SdTUM5la_c7fBysdvsLS2Id0DCC9ikOR0HKpsEN9O9X2GUVGYkR",
  //   "ff4-MzWsSnGm-v-6gdzJEe:APA91bE-BIzhFQKJ8NluXP6M8ufXrssJCJOBfJlkFJAlBVmEz8FmdQ-qHKR6n2OgMYGKp_jUzgbgfTmN6k5ZST0F5SdTUM5la_c7fBysdvsLS2Id0DCC9ikOR0HKpsEN9O9X2GUVGYkR",
  // ];
  // Create a new instance of FCM with your Firebase Cloud Messaging server key
  const serverKey =
    "AAAA0zMv334:APA91bGxP14wuNz0nLfJbw7P_JADM7ZdqU96lbfOLzHUvaSdywMNN8ESwQKPbuUv8OUj6uDF9sOGxuUEHFmVF2VAIIacBWZbyWDgXJWSycdAZkgozAULaeVI-OHKSHYfxSrDVFXyAO_v";
  const fcm = new FCM(serverKey);

  // Get the registration token of the device you want to send the notification to
  //const registrationToken = 'YOUR_DEVICE_REGISTRATION_TOKEN';

  // Define the notification payload
  const message = {
    registration_ids: registrationToken,
    notification: {
      title: "Renew Membership",
      body: "Hi, your Tiffin Membership has been expired on 03rd August 2023. Please renew",
    },
  };

  // Send the notification
  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Error sending notification:", err);
    } else {
      console.log("Notification sent successfully:", response);
    }
  });

  return res.status(200).json({ message: "Notification sent successfully" });
}
exports.sendNotification = sendNotification;
async function get(req, res) {
  var input = req.body;
  var errorData = {};
  if (!input.id) {
    errorData.id = "Id is required";
  }
  if (input.device_token && input.device_token.length <= 10) {
    errorData.device_token =
      "Device token length must be greater than 10 characters";
  }
  var result = await Students.findOne({ _id: input.id });

  if (Object.keys(errorData).length == 0) {
    if (input.id && !input.device_token) {
      result = await Students.findOne({ _id: input.id });
      res.status(200).json({
        status: true,
        data: result,
      });
    } else {
      var updateToken = await Students.findByIdAndUpdate(input.id, {
        device_token: input.device_token,
      });
      if (updateToken) {
        var result = await Students.findOne({ _id: input.id });
        res.status(200).json({
          status: true,
          data: result,
        });
      }
    }
  } else {
    res.status(200).json({
      status: true,
      data: result,
      error: errorData,
    });
  }
}
exports.get = get;
async function downloadFile(qrCodeUrl, filePath) {
  try {
    const response = await axios({
      url: qrCodeUrl,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Error:", error);
  }
}
async function getAmount(req, res, next) {
  var result = await membershipTypeOption.findOne({_id: req.params.id});
  if (result){
    res.status(200).json({
      status: true,
      data: result,
    });
  }else{
    res.status(200).json({
      status: false,
      error: "Enter correct membership option id"
    });
  }
}
exports.getAmount = getAmount;
