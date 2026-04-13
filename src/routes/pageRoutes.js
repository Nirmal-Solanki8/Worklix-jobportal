const express = require("express");
const {
  attachUserIfAny,
  protectPage,
  authorizePageRoles,
} = require("../middleware/authMiddleware");
const uploadProfilePhoto = require("../middleware/uploadProfilePhoto");
const pageController = require("../controllers/pageController");

const handleProfileUpload = (req, res, next) => {
  uploadProfilePhoto.single("profilePhoto")(req, res, (err) => {
    if (err) {
      const msg = err.message || "Could not upload photo";
      const join = req.originalUrl.includes("?") ? "&" : "?";
      return res.redirect(`${req.originalUrl.split("?")[0]}${join}error=${encodeURIComponent(msg)}`);
    }
    next();
  });
};

const router = express.Router();

router.use(attachUserIfAny);

router.get("/", pageController.homePage);
router.get("/jobs", pageController.jobsPage);
router.get("/jobs/preview/:id", pageController.jobPreviewJson);
router.get(
  "/jobs/new",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.postJobPage,
);
router.post(
  "/jobs/new",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.createJobFromPage,
);
router.get(
  "/jobs/:id/edit",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.editJobPage,
);
router.post(
  "/jobs/:id/edit",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.updateJobFromPage,
);
router.post(
  "/jobs/:id/delete",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.deleteJobFromPage,
);
router.post(
  "/jobs/:id/status",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.updateJobStatusFromPage,
);
router.post(
  "/jobs/:id/apply",
  protectPage,
  authorizePageRoles("jobseeker"),
  pageController.applyToJobFromPage,
);

router.get(
  "/applications/recruiter",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.recruiterApplicantsPage,
);
router.get(
  "/jobs/:id/applicants",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.jobApplicantsPage,
);
router.post(
  "/applications/:id/status",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.updateApplicationStatusFromPage,
);
router.post(
  "/applications/:id/withdraw",
  protectPage,
  authorizePageRoles("jobseeker"),
  pageController.withdrawApplicationFromPage,
);

router.get("/jobs-page", (req, res) => res.redirect("/jobs"));
router.get("/jobs/:id", pageController.jobDetailsPage);
router.get("/login", pageController.loginPage);
router.get("/register", pageController.registerPage);
router.get("/about", pageController.aboutPage);
router.get("/contact", pageController.contactPage);
router.get("/companies", pageController.companiesPage);

router.post("/auth/login", pageController.postLogin);
router.post("/auth/register", pageController.postRegister);
router.post("/auth/logout", pageController.postLogout);

router.get(
  "/profile",
  protectPage,
  authorizePageRoles("jobseeker", "employer", "admin"),
  pageController.profilePage,
);
router.post(
  "/profile",
  protectPage,
  authorizePageRoles("jobseeker", "employer", "admin"),
  handleProfileUpload,
  pageController.updateProfile,
);

router.get(
  "/applications/me",
  protectPage,
  authorizePageRoles("jobseeker"),
  pageController.jobseekerDashboardPage,
);
router.get(
  "/dashboard/jobseeker",
  protectPage,
  authorizePageRoles("jobseeker"),
  pageController.jobseekerDashboardPage,
);
router.get(
  "/dashboard/employer",
  protectPage,
  authorizePageRoles("employer", "admin"),
  pageController.employerDashboardPage,
);
router.get(
  "/dashboard/admin",
  protectPage,
  authorizePageRoles("admin"),
  pageController.adminDashboardPage,
);

router.get(
  "/admin/users",
  protectPage,
  authorizePageRoles("admin"),
  pageController.adminUsersPage,
);
router.get(
  "/admin/jobs",
  protectPage,
  authorizePageRoles("admin"),
  pageController.adminJobsPage,
);
router.get(
  "/admin/applications",
  protectPage,
  authorizePageRoles("admin"),
  pageController.adminApplicationsPage,
);
router.post(
  "/admin/users/:id/role",
  protectPage,
  authorizePageRoles("admin"),
  pageController.updateUserRoleFromPage,
);

module.exports = router;
