var express = require("express");
var router = express.Router();
var StudentsController = require("../controllers/api/StudentsController");
var MembershipsController = require("../controllers/api/MembershipsController");
var PayHistoriesController = require("../controllers/api/PayHistoriesController");
var ScheduleOffController = require("../controllers/api/ScheduleOffController");
var MembershipRenewController = require("../controllers/api/MembershipRenewController");


router.get("/membershipTypes", MembershipsController.membershipTypes);
router.get("/membershipTypeOptions/get/:id", MembershipsController.getOptions);
router.post("/Students/registration", StudentsController.registration);
router.get("/Students/send_notification", StudentsController.sendNotification);
router.post("/Students/login", StudentsController.login);
router.get("/Students/logout/:id", StudentsController.logout);
router.post("/Students/get", StudentsController.get);
router.post("/PayHistories/save", PayHistoriesController.save);
router.post("/ScheduleOff/save", ScheduleOffController.save);
router.get("/ScheduleOff/status/:id", ScheduleOffController.status);
router.get("/ScheduleOff/student/:id", ScheduleOffController.list);
router.get("/getAmount/:id", StudentsController.getAmount);

router.post("/MembershipRenew/save", MembershipRenewController.save);
module.exports = router;
