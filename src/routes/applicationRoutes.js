const express = require("express");
const {
  applyToJob,
  getMyApplications,
  getApplicantsForRecruiter,
  getApplicantsForJob,
  updateApplicationStatus,
  withdrawApplication,
} = require("../controllers/applicationController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.post('/apply/:jobId' , protect , authorizeRoles('jobseeker'),applyToJob);
router.get('/my-applications' , protect , authorizeRoles('jobseeker'),getMyApplications);
router.get('/recruiter-application' , protect , authorizeRoles('employer' , 'admin') , getApplicantsForRecruiter);
router.get("/job/:jobId", protect, authorizeRoles("employer", "admin"), getApplicantsForJob);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer", "admin"),
  updateApplicationStatus,
);
router.delete("/:id", protect, authorizeRoles("jobseeker"), withdrawApplication);

module.exports = router;
