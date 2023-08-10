var express = require("express");
var router = express.Router();
var AdminController = require("../controllers/admin/AdminController");
var UsersController = require("../controllers/admin/UsersController");
var StudentsController = require("../controllers/admin/StudentsController");
var LocationsController = require("../controllers/admin/LocationsController");
var ContentsController = require("../controllers/admin/ContentsController");
var MembershipsController = require("../controllers/admin/MembershipsController");
var ScheduleOffController = require("../controllers/admin/ScheduleOffController");
var SettingController = require("../controllers/admin/SettingController");

/** Routes for admin  */
//router.get('/login', AdminController.login);
router.post("/admin/login", AdminController.login);
router.get("/admin/login", AdminController.login);
router.get(
  "/admin/Dashboard",
  requiredAuthentication,
  AdminController.dashboard
);
router.get("/admin/logout", AdminController.logout);

/** Routes for users module  */
router.get("/admin/Users/list", requiredAuthentication, UsersController.list);
router.get(
  "/admin/Users/All-List",
  requiredAuthentication,
  UsersController.All_list
);
router.get(
  "/admin/Users/edit/:id",
  requiredAuthentication,
  UsersController.edit
);
router.post(
  "/admin/Users/edit/:id",
  requiredAuthentication,
  UsersController.edit
);
router.post("/admin/Users/add", requiredAuthentication, UsersController.add);
router.get("/admin/Users/add", requiredAuthentication, UsersController.add);
router.get(
  "/admin/Users/delete/:id",
  requiredAuthentication,
  UsersController.deleteRecord
);

/** Routes for students module  */
router.get(
  "/admin/Students/list",
  requiredAuthentication,
  StudentsController.list
);
router.get("/admin/Students/All-List", StudentsController.All_list);
router.get(
  "/admin/Students/get/:id",
  StudentsController.get
);
router.get(
  "/admin/Students/edit/:id",
  requiredAuthentication,
  StudentsController.edit
);
router.post(
  "/admin/Students/edit/:id",
  requiredAuthentication,
  StudentsController.edit
);
router.post(
  "/admin/Students/add",
  requiredAuthentication,
  StudentsController.add
);
router.get(
  "/admin/Students/add",
  requiredAuthentication,
  StudentsController.add
);
router.get(
  "/admin/Students/delete/:id",
  requiredAuthentication,
  StudentsController.deleteRecord
);
router.get(
  "/admin/payment-history",
  requiredAuthentication,
  StudentsController.payment_history
);
router.get(
  "/admin/payment-history/get/:id",
  requiredAuthentication,
  StudentsController.get_payment_history
);
router.post(
  "/admin/check-expiry",
  requiredAuthentication,
  StudentsController.check_expiry
);
router.post("/admin/Students/endDate", StudentsController.endDate);
router.get(
  "/admin/generate-otp",
  requiredAuthentication,
  StudentsController.generate_otp_page
);
router.post("/admin/generate-otp", StudentsController.generate_otp);

/** Routes for location module */
router.get(
  "/admin/locations",
  requiredAuthentication,
  LocationsController.index
);
router.get(
  "/admin/locations/all",
  requiredAuthentication,
  LocationsController.all
);
router.post(
  "/admin/locations/add",
  requiredAuthentication,
  LocationsController.add
);
router.get(
  "/admin/locations/delete/:id",
  requiredAuthentication,
  LocationsController.deleteRecord
);
router.get(
  "/admin/locations/get/:id",
  requiredAuthentication,
  LocationsController.get
);
router.post(
  "/admin/locations/edit/:id",
  requiredAuthentication,
  LocationsController.edit
);
/* route for content */
router.get("/admin/content", requiredAuthentication, ContentsController.index);
router.post(
  "/admin/content/edit/:id",
  requiredAuthentication,
  ContentsController.edit
);
router.get(
  "/admin/content/get",
  requiredAuthentication,
  ContentsController.get
);

/* routes for membership */
router.get(
  "/admin/Memberships/types",
  requiredAuthentication,
  MembershipsController.typesIndex
);
router.post(
  "/admin/Memberships/add_type",
  requiredAuthentication,
  MembershipsController.addType
);
router.get(
  "/admin/Memberships/delete_type/:id",
  requiredAuthentication,
  MembershipsController.deleteType
);
router.get(
  "/admin/Memberships/get_type/:id",
  requiredAuthentication,
  MembershipsController.getType
);
router.post(
  "/admin/Memberships/update_type/:id",
  requiredAuthentication,
  MembershipsController.editType
);
router.get(
  "/admin/Memberships/options",
  requiredAuthentication,
  MembershipsController.optionsIndex
);
router.get(
  "/admin/Memberships/types_list",
  requiredAuthentication,
  MembershipsController.types_list
);
router.post(
  "/admin/Memberships/add_option",
  requiredAuthentication,
  MembershipsController.addOption
);
router.get(
  "/admin/Memberships/get_option/:id",
  requiredAuthentication,
  MembershipsController.getOption
);
router.get(
  "/admin/Memberships/options_list",
  requiredAuthentication,
  MembershipsController.options_list
);
router.post(
  "/admin/Memberships/update_option/:id",
  requiredAuthentication,
  MembershipsController.updateOption
);
router.get(
  "/admin/Memberships/delete_option/:id",
  requiredAuthentication,
  MembershipsController.deleteOption
);

/* route for schedule off */
router.get(
  "/admin/schedule-off",
  requiredAuthentication,
  ScheduleOffController.index
);
router.get(
  "/admin/schedule-off/list",
  ScheduleOffController.list
);
router.post(
  "/admin/schedule-off/status",
  requiredAuthentication,
  ScheduleOffController.status
);
router.get("/admin/student/contact/:number",requiredAuthentication,ScheduleOffController.getStudent);
router.get("/admin/setting",requiredAuthentication,SettingController.index);
router.post("/admin/edit-setting",requiredAuthentication,SettingController.edit);

module.exports = router;

function requiredAuthentication(req, res, next) {
  if (req.session) {
    LoginUser = req.session.LoginUser;
    if (LoginUser) {
      next();
    } else {
      res.redirect(nodeAdminUrl + "/login");
    }
  } else {
    res.redirect(nodeAdminUrl + "/login");
  }
}
