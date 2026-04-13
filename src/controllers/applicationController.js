const Application = require("../models/applicationModel");
const Job = require("../models/jobModel");
const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

const applyToJob = async (req, res) => {
  try {
    const { coverLetter, resume } = req.body;
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.status !== "open") {
      return res.status(400).json({ message: "This job is no longer open" });
    }

    if (job.recruiter.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot apply to your own job" });
    }

    const existingApplication = await Application.findOne({
      applicant: req.user._id,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You already applied to this job",
      });
    }

    const application = await Application.create({
      applicant: req.user._id,
      job: jobId,
      recruiter: job.recruiter,
      resume,
      coverLetter,
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate("job")
      .populate("recruiter", "name email companyName");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getApplicantsForRecruiter = async (req, res) => {
  try {
    const applications = await Application.find({ recruiter: req.user._id })
      .populate("applicant", "name email phone skills")
      .populate("job", "title company location");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const getApplicantsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (
      req.user.role !== "admin" &&
      job.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate("applicant", "name email phone skills")
      .populate("job", "title company location")
      .sort({ createdAt: -1 });

    return res.status(200).json(applications);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const application = await Application.findById(req.params.id).populate("job");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (
      req.user.role !== "admin" &&
      application.recruiter.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    application.status = status;
    await application.save();
    return res
      .status(200)
      .json({ message: "Application status updated", application });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const withdrawApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Application.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Application withdrawn successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getApplicantsForRecruiter,
  getApplicantsForJob,
  updateApplicationStatus,
  withdrawApplication,
};