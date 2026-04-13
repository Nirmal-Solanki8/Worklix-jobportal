const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Job = require("../models/jobModel");
const Application = require("../models/applicationModel");
const parseArrayField = require("../utils/parseArrayField");

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const jobTypes = ["Full-Time", "Part-Time", "Internship", "Remote", "Contract"];
const experienceLevels = ["Fresher", "Junior", "Mid", "Senior"];

const buildJobPayload = (body) => {
  const payload = {
    title: body.title,
    company: body.company,
    location: body.location,
    salary: body.salary,
    category: body.category,
    description: body.description,
    requirements: parseArrayField(body.requirements),
  };

  payload.jobType = jobTypes.includes(body.jobType) ? body.jobType : "Full-Time";
  payload.experienceLevel = experienceLevels.includes(body.experienceLevel)
    ? body.experienceLevel
    : "Fresher";
  payload.deadline = body.deadline ? new Date(body.deadline) : null;

  return payload;
};

const tokenForUser = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const redirectWith = (res, path, type, message, fallback = "/") => {
  if (path === "back") {
    const target = res.req.get("Referrer") || fallback;
    const joinChar = target.includes("?") ? "&" : "?";
    return res.redirect(`${target}${joinChar}${type}=${encodeURIComponent(message)}`);
  }

  return res.redirect(`${path}?${type}=${encodeURIComponent(message)}`);
};

const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const postedLabel = (createdAt) => {
  if (!createdAt) return "Recently";
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
  if (days <= 0) return "Posted today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
};

const photoUrl = (stored) => {
  if (!stored || typeof stored !== "string" || !stored.trim()) return null;
  const p = stored.trim().replace(/^\//, "");
  return `/${p}`;
};

const enrichJobCard = (j) => {
  const rec = j.recruiter;
  const recName = rec && typeof rec === "object" ? rec.name : "";
  const initial = String(recName || j.company || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  const recPhoto =
    rec && typeof rec === "object" && rec.profilePhoto ? photoUrl(rec.profilePhoto) : null;
  return {
    ...j,
    postedLabel: postedLabel(j.createdAt),
    companyInitial: String(j.company || "?")
      .trim()
      .charAt(0)
      .toUpperCase(),
    recruiterInitial: initial,
    recruiterPhotoUrl: recPhoto,
  };
};

const homePage = async (req, res) => {
  const [jobDocs, openJobCount] = await Promise.all([
    Job.find({ status: "open" })
      .sort({ createdAt: -1 })
      .populate("recruiter", "name companyName profilePhoto")
      .lean(),
    Job.countDocuments({ status: "open" }),
  ]);

  const jobs = jobDocs.map((j) => enrichJobCard(j));

  return res.render("home", { jobs, openJobCount });
};

const jobsPage = async (req, res) => {
  const filters = { status: "open" };
  const keyword =
    typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
  const location =
    typeof req.query.location === "string" ? req.query.location.trim() : "";
  const jobTypeFilter =
    typeof req.query.jobType === "string" ? req.query.jobType.trim() : "";
  const experienceFilter =
    typeof req.query.experienceLevel === "string" ? req.query.experienceLevel.trim() : "";
  const categoryFilter =
    typeof req.query.category === "string" ? req.query.category.trim() : "";
  const sortRaw = typeof req.query.sort === "string" ? req.query.sort.trim() : "newest";

  if (keyword) {
    const safe = escapeRegex(keyword);
    filters.$or = [
      { title: new RegExp(safe, "i") },
      { company: new RegExp(safe, "i") },
      { description: new RegExp(safe, "i") },
    ];
  }
  if (location) {
    filters.location = new RegExp(escapeRegex(location), "i");
  }
  if (jobTypes.includes(jobTypeFilter)) {
    filters.jobType = jobTypeFilter;
  }
  if (experienceLevels.includes(experienceFilter)) {
    filters.experienceLevel = experienceFilter;
  }
  if (categoryFilter) {
    filters.category = new RegExp(escapeRegex(categoryFilter), "i");
  }

  let sortSpec = { createdAt: -1 };
  if (sortRaw === "oldest") sortSpec = { createdAt: 1 };
  if (sortRaw === "title") sortSpec = { title: 1 };
  if (sortRaw === "company") sortSpec = { company: 1 };

  const [jobDocs, locationSuggestions, categoriesRaw] = await Promise.all([
    Job.find(filters)
      .populate("recruiter", "name companyName profilePhoto")
      .sort(sortSpec)
      .lean(),
    Job.distinct("location", { status: "open" }),
    Job.distinct("category", { status: "open" }),
  ]);

  const cities = locationSuggestions
    .filter((s) => s && String(s).trim())
    .map((s) => String(s).trim());
  cities.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const categoriesList = categoriesRaw
    .filter((c) => c && String(c).trim())
    .map((c) => String(c).trim());
  categoriesList.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));

  const jobs = jobDocs.map((j) => enrichJobCard(j));

  return res.render("jobs", {
    jobs,
    keyword,
    location,
    jobType: jobTypeFilter,
    experienceLevel: experienceFilter,
    category: categoryFilter,
    sort: sortRaw,
    locationSuggestions: cities,
    categoriesList,
    jobTypesList: jobTypes,
    experienceLevelsList: experienceLevels,
  });
};

const jobPreviewJson = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Not found" });
  }
  const job = await Job.findById(id)
    .populate("recruiter", "name companyName profilePhoto")
    .lean();
  if (!job || job.status !== "open") {
    return res.status(404).json({ error: "Not found" });
  }

  let hasApplied = false;
  if (req.user && req.user.role === "jobseeker") {
    hasApplied = !!(await Application.exists({ applicant: req.user._id, job: job._id }));
  }

  const rec = job.recruiter;
  const recruiterPhotoUrl =
    rec && rec.profilePhoto ? photoUrl(rec.profilePhoto) : null;
  const recruiterName = rec && rec.name ? rec.name : "";
  const recruiterCompany = rec && rec.companyName ? rec.companyName : "";

  return res.json({
    job: {
      _id: job._id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary || "",
      jobType: job.jobType,
      category: job.category || "",
      experienceLevel: job.experienceLevel,
      description: job.description,
      requirements: job.requirements || [],
      deadline: job.deadline ? new Date(job.deadline).toISOString() : null,
      createdAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
      recruiter: {
        name: recruiterName,
        companyName: recruiterCompany,
        photoUrl: recruiterPhotoUrl,
        initial: String(recruiterName || job.company || "?")
          .trim()
          .charAt(0)
          .toUpperCase(),
      },
    },
    hasApplied,
    canApply: !!(req.user && req.user.role === "jobseeker" && !hasApplied),
    isJobseeker: !!(req.user && req.user.role === "jobseeker"),
    isLoggedIn: !!req.user,
  });
};

const profilePage = async (req, res) => {
  const user = await User.findById(req.user._id).select("-password").lean();
  if (!user) {
    return res.redirect("/login?error=Session expired");
  }
  return res.render("profile", { profileUser: user });
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return redirectWith(res, "/login", "error", "Session expired");
    }

    const { name, phone, companyName, skills, newPassword, newPasswordConfirm } = req.body;

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }
    if (typeof phone === "string") {
      user.phone = phone.trim();
    }
    if (
      (user.role === "employer" || user.role === "admin") &&
      typeof companyName === "string"
    ) {
      user.companyName = companyName.trim();
    }
    if (user.role === "jobseeker" && typeof skills === "string") {
      user.skills = parseArrayField(skills);
    }

    if (req.file) {
      const relPath = `uploads/profiles/${req.file.filename}`;
      user.profilePhoto = relPath;
    }

    const np = typeof newPassword === "string" ? newPassword : "";
    const npc =
      typeof newPasswordConfirm === "string" ? newPasswordConfirm : "";
    if (np || npc) {
      if (np.length < 6) {
        return redirectWith(res, "/profile", "error", "New password must be at least 6 characters");
      }
      if (np !== npc) {
        return redirectWith(res, "/profile", "error", "Passwords do not match");
      }
      user.password = np;
    }

    await user.save();
    return redirectWith(res, "/profile", "success", "Profile updated");
  } catch (err) {
    const msg =
      err && err.message ? err.message : "Could not update profile";
    return redirectWith(res, "/profile", "error", msg);
  }
};

const jobDetailsPage = async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "recruiter",
    "name email companyName profilePhoto",
  );
  if (!job) {
    return res.status(404).render("404");
  }
  return res.render("job-details", { job });
};

const loginPage = async (req, res) => res.render("login");
const registerPage = async (req, res) => res.render("register");
const aboutPage = async (req, res) => res.render("about");
const contactPage = async (req, res) => res.render("contact");
const companiesPage = async (req, res) => {
  const companies = await User.find({ role: "employer" })
    .select("companyName name email")
    .sort({ createdAt: -1 });
  return res.render("companies", { companies });
};

const postLogin = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!normalizedEmail || !password) {
    return redirectWith(res, "/login", "error", "Email and password are required");
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.comparePassword(password))) {
    return redirectWith(res, "/login", "error", "Invalid email or password");
  }

  setAuthCookie(res, tokenForUser(user));
  if (user.role === "jobseeker") return res.redirect("/dashboard/jobseeker");
  if (user.role === "employer") return res.redirect("/dashboard/employer");
  return res.redirect("/dashboard/admin");
};

const postRegister = async (req, res) => {
  const { name, email, password, role, phone, skills, companyName } = req.body;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!name || !normalizedEmail || !password) {
    return redirectWith(
      res,
      "/register",
      "error",
      "Name, email, and password are required",
    );
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return redirectWith(res, "/register", "error", "User already exists");
  }

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || "jobseeker",
    phone,
    skills: parseArrayField(skills),
    companyName,
  });

  setAuthCookie(res, tokenForUser(user));
  if (user.role === "employer") return res.redirect("/dashboard/employer");
  return res.redirect("/dashboard/jobseeker");
};

const postLogout = async (req, res) => {
  res.clearCookie("token");
  return redirectWith(res, "/", "success", "Logged out successfully");
};

const jobseekerDashboardPage = async (req, res) => {
  const applications = await Application.find({ applicant: req.user._id })
    .populate("job")
    .sort({ createdAt: -1 });
  return res.render("applicant-dashboard", { applications });
};

const employerDashboardPage = async (req, res) => {
  const jobs = await Job.find({ recruiter: req.user._id }).sort({ createdAt: -1 });
  return res.render("recruiter-dashboard", { jobs });
};

const adminDashboardPage = async (req, res) => {
  const [usersCount, jobsCount, applicationsCount] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
  ]);
  return res.render("admin-dashboard", {
    metrics: { usersCount, jobsCount, applicationsCount },
  });
};

const postJobPage = async (req, res) => res.render("post-job", { job: null });

const editJobPage = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (
    req.user.role !== "admin" &&
    job.recruiter.toString() !== req.user._id.toString()
  ) {
    return redirectWith(res, "/dashboard/employer", "error", "Access denied");
  }
  return res.render("post-job", { job });
};

const createJobFromPage = async (req, res) => {
  try {
    const { title, company, location, description } = req.body;
    if (!title || !company || !location || !description) {
      return redirectWith(res, "/jobs/new", "error", "Please fill required fields");
    }

    const payload = buildJobPayload(req.body);
    await Job.create({
      ...payload,
      recruiter: req.user._id,
    });
    return redirectWith(res, "/dashboard/employer", "success", "Job created");
  } catch (error) {
    return redirectWith(res, "/jobs/new", "error", "Unable to create job. Check fields.");
  }
};

const updateJobFromPage = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).render("404");
    if (
      req.user.role !== "admin" &&
      job.recruiter.toString() !== req.user._id.toString()
    ) {
      return redirectWith(res, "/dashboard/employer", "error", "Access denied");
    }

    const payload = buildJobPayload(req.body);
    await Job.findByIdAndUpdate(req.params.id, payload, { runValidators: true });
    return redirectWith(res, "/dashboard/employer", "success", "Job updated");
  } catch (error) {
    return redirectWith(
      res,
      `/jobs/${req.params.id}/edit`,
      "error",
      "Unable to update job. Check fields.",
    );
  }
};

const deleteJobFromPage = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (
    req.user.role !== "admin" &&
    job.recruiter.toString() !== req.user._id.toString()
  ) {
    return redirectWith(res, "/dashboard/employer", "error", "Access denied");
  }
  await Job.findByIdAndDelete(req.params.id);
  return redirectWith(res, "/dashboard/employer", "success", "Job deleted");
};

const updateJobStatusFromPage = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (
    req.user.role !== "admin" &&
    job.recruiter.toString() !== req.user._id.toString()
  ) {
    return redirectWith(res, "/dashboard/employer", "error", "Access denied");
  }
  const status = req.body.status === "closed" ? "closed" : "open";
  job.status = status;
  await job.save();
  return redirectWith(res, "/dashboard/employer", "success", "Status updated");
};

const applyToJobFromPage = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (job.status !== "open") {
    return redirectWith(res, `/jobs/${req.params.id}`, "error", "Job is closed");
  }
  const exists = await Application.findOne({
    applicant: req.user._id,
    job: req.params.id,
  });
  if (exists) {
    return redirectWith(res, `/jobs/${req.params.id}`, "error", "Already applied");
  }
  await Application.create({
    applicant: req.user._id,
    job: req.params.id,
    recruiter: job.recruiter,
    resume: req.body.resume,
    coverLetter: req.body.coverLetter,
  });
  const ref = req.get("referer") || req.get("referrer") || "";
  const fromJobs = ref.includes("/jobs");
  if (fromJobs && !/\/jobs\/[a-f0-9]{24}$/i.test(ref.split("?")[0])) {
    return redirectWith(res, "/jobs", "success", "Application submitted");
  }
  return redirectWith(res, "/dashboard/jobseeker", "success", "Application submitted");
};

const recruiterApplicantsPage = async (req, res) => {
  const applications = await Application.find({ recruiter: req.user._id })
    .populate("applicant", "name email phone skills")
    .populate("job", "title company location")
    .sort({ createdAt: -1 });
  return res.render("applicant", { applications });
};

const jobApplicantsPage = async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) return res.status(404).render("404");
  if (
    req.user.role !== "admin" &&
    job.recruiter.toString() !== req.user._id.toString()
  ) {
    return redirectWith(res, "/dashboard/employer", "error", "Access denied");
  }
  const applications = await Application.find({ job: req.params.id })
    .populate("applicant", "name email phone skills")
    .populate("job", "title company location")
    .sort({ createdAt: -1 });
  return res.render("applicant", { applications, selectedJob: job });
};

const updateApplicationStatusFromPage = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).render("404");
  if (
    req.user.role !== "admin" &&
    application.recruiter.toString() !== req.user._id.toString()
  ) {
    return redirectWith(res, "/dashboard/employer", "error", "Access denied");
  }
  const valid = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
  const status = valid.includes(req.body.status) ? req.body.status : "pending";
  application.status = status;
  await application.save();
  return redirectWith(res, "back", "success", "Application updated");
};

const withdrawApplicationFromPage = async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) return res.status(404).render("404");
  if (application.applicant.toString() !== req.user._id.toString()) {
    return redirectWith(res, "/dashboard/jobseeker", "error", "Access denied");
  }
  await Application.findByIdAndDelete(req.params.id);
  return redirectWith(res, "/dashboard/jobseeker", "success", "Application withdrawn");
};

const adminUsersPage = async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  return res.render("admin-users", { users });
};
const adminJobsPage = async (req, res) => {
  const jobs = await Job.find().populate("recruiter", "name email").sort({ createdAt: -1 });
  return res.render("admin-jobs", { jobs });
};
const adminApplicationsPage = async (req, res) => {
  const applications = await Application.find()
    .populate("applicant", "name email")
    .populate("recruiter", "name email")
    .populate("job", "title company")
    .sort({ createdAt: -1 });
  return res.render("admin-applications", { applications });
};

const updateUserRoleFromPage = async (req, res) => {
  const role = req.body.role;
  if (!["jobseeker", "employer", "admin"].includes(role)) {
    return redirectWith(res, "/admin/users", "error", "Invalid role");
  }
  await User.findByIdAndUpdate(req.params.id, { role });
  return redirectWith(res, "/admin/users", "success", "Role updated");
};

module.exports = {
  homePage,
  jobsPage,
  jobPreviewJson,
  profilePage,
  updateProfile,
  jobDetailsPage,
  loginPage,
  registerPage,
  aboutPage,
  contactPage,
  companiesPage,
  postLogin,
  postRegister,
  postLogout,
  jobseekerDashboardPage,
  employerDashboardPage,
  adminDashboardPage,
  postJobPage,
  editJobPage,
  createJobFromPage,
  updateJobFromPage,
  deleteJobFromPage,
  updateJobStatusFromPage,
  applyToJobFromPage,
  recruiterApplicantsPage,
  jobApplicantsPage,
  updateApplicationStatusFromPage,
  withdrawApplicationFromPage,
  adminUsersPage,
  adminJobsPage,
  adminApplicationsPage,
  updateUserRoleFromPage,
};
