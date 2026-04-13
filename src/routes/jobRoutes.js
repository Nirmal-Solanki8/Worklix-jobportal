const express = require("express");
const {
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getAllJobs,
  getSingleJob,
  getRecruiterJobs,
} = require("../controllers/jobController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllJobs);
router.get(
  "/my-jobs",
  protect,
  authorizeRoles("employer", "admin"),
  getRecruiterJobs,
);

router.get("/:id", getSingleJob);
router.post("/", protect, authorizeRoles("employer", "admin"), createJob);
router.put("/:id", protect, authorizeRoles("employer", "admin"), updateJob);
router.delete("/:id", protect, authorizeRoles("employer", "admin"), deleteJob);
router.patch(
  "/:id/status",
  protect,
  authorizeRoles("employer", "admin"),
  updateJobStatus,
);

module.exports = router;
