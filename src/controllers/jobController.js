const Job = require("../models/jobModel");
const parseArrayField = require("../utils/parseArrayField");

const canManageJob = (job, user) => {
  return (
    user.role === "admin" || job.recruiter.toString() === user._id.toString()
  );
};

const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      location,
      salary,
      jobType,
      category,
      experienceLevel,
      description,
      requirements,
      deadline,
    } = req.body;

    if (!title || !company || !location || !description) {
      return res.status(400).json({
        message: "Title, company, location, and description are required",
      });
    }

    const job = await Job.create({
      title,
      company,
      location,
      salary,
      jobType,
      category,
      experienceLevel,
      description,
      requirements: parseArrayField(requirements),
      deadline,
      recruiter: req.user._id,
    });

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!canManageJob(job, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payload = {
      title: req.body.title,
      company: req.body.company,
      location: req.body.location,
      salary: req.body.salary,
      jobType: req.body.jobType,
      category: req.body.category,
      experienceLevel: req.body.experienceLevel,
      description: req.body.description,
      deadline: req.body.deadline || null,
    };

    if (req.body.requirements !== undefined) {
      payload.requirements = parseArrayField(req.body.requirements);
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!canManageJob(job, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Job.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["open", "closed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (!canManageJob(job, req.user)) {
      return res.status(403).json({ message: "Access denied" });
    }

    job.status = status;
    await job.save();

    return res.status(200).json({
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.status) {
      filters.status = req.query.status;
    } else {
      filters.status = "open";
    }
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.location) {
      filters.location = new RegExp(req.query.location, "i");
    }
    if (req.query.keyword) {
      filters.$or = [
        { title: new RegExp(req.query.keyword, "i") },
        { company: new RegExp(req.query.keyword, "i") },
        { description: new RegExp(req.query.keyword, "i") },
      ];
    }

    const jobs = await Job.find(filters)
      .populate("recruiter", "name email companyName")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getSingleJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "recruiter",
      "name email companyName"
    );

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getRecruiterJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
  getAllJobs,
  getSingleJob,
  getRecruiterJobs,
};