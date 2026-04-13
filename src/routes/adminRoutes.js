const express = require("express");
const {
  listUsers,
  listJobs,
  listApplications,
  updateUserRole,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));
router.get("/users", listUsers);
router.get("/jobs", listJobs);
router.get("/applications", listApplications);
router.patch("/users/:id/role", updateUserRole);

module.exports = router;
