const User = require("../models/userModel");
const Job = require("../models/jobModel");
const Application = require("../models/applicationModel");

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("recruiter", "name email role")
      .sort({ createdAt: -1 });
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const listApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("applicant", "name email role")
      .populate("recruiter", "name email")
      .populate("job", "title company")
      .sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["jobseeker", "employer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  listUsers,
  listJobs,
  listApplications,
  updateUserRole,
};
