const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../src/models/userModel");
const Job = require("../src/models/jobModel");
const Application = require("../src/models/applicationModel");

const DB_URI = process.env.DB_URI || "mongodb://127.0.0.1:27017/jobportal";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB at:", DB_URI);
    await mongoose.connect(DB_URI);
    console.log("Connected successfully!");

    // Clear existing data for a clean slate
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
    console.log("Cleared existing users, jobs, and applications.");

    // Default password for all seed accounts
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Create Users
    const usersData = [
      {
        name: "Alex Rivera",
        email: "candidate@worklix.com",
        password: hashedPassword,
        role: "jobseeker",
        phone: "+1 (555) 234-5678",
        skills: ["React", "TypeScript", "Node.js", "Express", "MongoDB", "Tailwind CSS"],
        companyName: "",
        profilePhoto: ""
      },
      {
        name: "Sophia Chen",
        email: "sophia@example.com",
        password: hashedPassword,
        role: "jobseeker",
        phone: "+1 (555) 345-6789",
        skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS", "Redis"],
        companyName: "",
        profilePhoto: ""
      },
      {
        name: "Marcus Vance",
        email: "marcus@example.com",
        password: hashedPassword,
        role: "jobseeker",
        phone: "+1 (555) 456-7890",
        skills: ["Figma", "UI/UX", "Design Systems", "User Research", "Prototyping"],
        companyName: "",
        profilePhoto: ""
      },
      {
        name: "Sarah Jenkins",
        email: "recruiter@worklix.com",
        password: hashedPassword,
        role: "employer",
        phone: "+1 (555) 987-6543",
        skills: ["Technical Recruitment", "Talent Acquisition"],
        companyName: "TechNova Labs",
        profilePhoto: ""
      },
      {
        name: "David Miller",
        email: "david@cloudscale.io",
        password: hashedPassword,
        role: "employer",
        phone: "+1 (555) 876-5432",
        skills: ["Engineering Management", "Hiring"],
        companyName: "CloudScale Technologies",
        profilePhoto: ""
      },
      {
        name: "Elena Rostova",
        email: "elena@apexai.dev",
        password: hashedPassword,
        role: "employer",
        phone: "+1 (555) 765-4321",
        skills: ["AI Systems", "Team Building"],
        companyName: "Apex AI Labs",
        profilePhoto: ""
      },
      {
        name: "Worklix Administrator",
        email: "admin@worklix.com",
        password: hashedPassword,
        role: "admin",
        phone: "+1 (555) 000-0001",
        skills: ["System Administration", "Operations"],
        companyName: "Worklix HQ",
        profilePhoto: ""
      }
    ];

    // Insert users using User.collection.insertMany or individual saves to preserve hashed password
    const createdUsers = await User.insertMany(usersData);
    console.log(`Created ${createdUsers.length} seed users.`);

    const candidateUser = createdUsers.find(u => u.email === "candidate@worklix.com");
    const sophiaUser = createdUsers.find(u => u.email === "sophia@example.com");
    const recruiterTechNova = createdUsers.find(u => u.email === "recruiter@worklix.com");
    const recruiterCloud = createdUsers.find(u => u.email === "david@cloudscale.io");
    const recruiterApex = createdUsers.find(u => u.email === "elena@apexai.dev");

    // 2. Create Realistic Jobs
    const jobsData = [
      {
        title: "Senior Full-Stack Engineer",
        company: "TechNova Labs",
        location: "San Francisco, CA (Remote)",
        salary: "$130,000 - $160,000 / yr",
        jobType: "Full-Time",
        category: "Software Engineering",
        experienceLevel: "Senior",
        description: "We are seeking an experienced Full-Stack Engineer to architect resilient web services and responsive client interfaces. You will collaborate directly with our founding team to build high-throughput data processing workflows and delightful developer dashboards.",
        requirements: [
          "5+ years of experience with Node.js and modern JavaScript/TypeScript",
          "Strong proficiency with React, Next.js, and state management",
          "Deep understanding of MongoDB schema design and query optimization",
          "Experience with Docker, CI/CD pipelines, and cloud deployments (AWS/GCP)"
        ],
        recruiter: recruiterTechNova._id,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Frontend Developer (React / TypeScript)",
        company: "TechNova Labs",
        location: "New York, NY",
        salary: "$95,000 - $125,000 / yr",
        jobType: "Full-Time",
        category: "Frontend Development",
        experienceLevel: "Mid",
        description: "Join TechNova's product engineering team to craft pixel-perfect, accessible, and lightning-fast user interfaces. You will transform Figma designs into reusable component libraries with an eye for micro-animations and performance.",
        requirements: [
          "3+ years building responsive web apps with React and modern CSS",
          "Proficiency with TypeScript and modern tooling (Vite, Webpack)",
          "Demonstrated knowledge of web accessibility (WCAG) and Core Web Vitals",
          "Familiarity with REST APIs and GraphQL integrations"
        ],
        recruiter: recruiterTechNova._id,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Cloud Infrastructure & DevOps Engineer",
        company: "CloudScale Technologies",
        location: "Remote (US / Europe)",
        salary: "$120,000 - $150,000 / yr",
        jobType: "Remote",
        category: "DevOps & Cloud",
        experienceLevel: "Senior",
        description: "CloudScale Technologies is scaling our Kubernetes infrastructure to support millions of daily events. You will own our multi-region deployments, automated zero-downtime release pipelines, and observability stack.",
        requirements: [
          "Proven experience with Terraform, Kubernetes, and AWS/Azure ecosystems",
          "Deep knowledge of Prometheus, Grafana, and Datadog monitoring",
          "Proficiency scripting in Python, Bash, or Go",
          "Strong security mindset (IAM, VPCs, network segmentation)"
        ],
        recruiter: recruiterCloud._id,
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Backend API Engineer (Node.js & Microservices)",
        company: "CloudScale Technologies",
        location: "Austin, TX (Hybrid)",
        salary: "$105,000 - $135,000 / yr",
        jobType: "Full-Time",
        category: "Backend Development",
        experienceLevel: "Mid",
        description: "Design and implement high-performance RESTful and gRPC APIs powering our real-time analytics suite. Work closely with database architects to ensure millisecond-level response times under heavy concurrent loads.",
        requirements: [
          "3+ years with Node.js/Express or NestJS in production",
          "Hands-on experience with Redis caching and message queues (Kafka/RabbitMQ)",
          "Proficiency in SQL (PostgreSQL) and NoSQL (MongoDB)",
          "Understanding of unit testing, integration testing, and Jest"
        ],
        recruiter: recruiterCloud._id,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Senior Product Designer (UI/UX)",
        company: "TechNova Labs",
        location: "Remote",
        salary: "$90,000 - $120,000 / yr",
        jobType: "Remote",
        category: "UI/UX Design",
        experienceLevel: "Senior",
        description: "Help us redefine how teams collaborate. You will lead end-to-end user research, prototype innovative interface patterns, and maintain our enterprise design system in Figma.",
        requirements: [
          "4+ years of product design experience for SaaS applications",
          "Exceptional portfolio showcasing UX thinking and visual elegance",
          "Mastery of Figma, design systems, and rapid prototyping",
          "Strong communication and cross-functional leadership skills"
        ],
        recruiter: recruiterTechNova._id,
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "AI / Machine Learning Engineer",
        company: "Apex AI Labs",
        location: "Seattle, WA (Remote)",
        salary: "$140,000 - $180,000 / yr",
        jobType: "Full-Time",
        category: "Artificial Intelligence",
        experienceLevel: "Senior",
        description: "Join Apex AI to build production LLM agents, retrieval-augmented generation (RAG) pipelines, and intelligent semantic search workflows integrated directly into enterprise applications.",
        requirements: [
          "MS or equivalent in Computer Science, Data Science, or related field",
          "Strong background with PyTorch, LangChain/LlamaIndex, and vector databases",
          "Experience deploying models using Triton, vLLM, or FastAPI on GPUs",
          "Demonstrated focus on model evaluation, prompt optimization, and safety"
        ],
        recruiter: recruiterApex._id,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Junior Web Developer (Internship to Hire)",
        company: "Apex AI Labs",
        location: "Bangalore, India",
        salary: "₹6 - 9 LPA",
        jobType: "Internship",
        category: "Software Engineering",
        experienceLevel: "Fresher",
        description: "An exciting opportunity for aspiring developers to gain hands-on production experience with modern JavaScript, Node.js, and web standards alongside seasoned mentors.",
        requirements: [
          "Solid foundational knowledge of HTML5, CSS3, and JavaScript (ES6+)",
          "Familiarity with Git version control and GitHub workflows",
          "Eagerness to learn backend architectures, REST APIs, and databases",
          "Strong problem-solving and algorithmic thinking"
        ],
        recruiter: recruiterApex._id,
        deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        status: "open"
      },
      {
        title: "Contract Data Engineer (ETL & Pipelines)",
        company: "CloudScale Technologies",
        location: "London, UK (Remote)",
        salary: "£550 - £650 / day",
        jobType: "Contract",
        category: "Data Engineering",
        experienceLevel: "Mid",
        description: "We are seeking a Contract Data Engineer for a 6-month engagement to optimize our streaming ETL pipelines, automate data ingestion, and ensure warehouse data integrity.",
        requirements: [
          "Hands-on experience with Apache Spark, dbt, and Snowflake/BigQuery",
          "Proficiency writing scalable Python and SQL data transformations",
          "Experience orchestrating workflows with Airflow or Prefect"
        ],
        recruiter: recruiterCloud._id,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: "open"
      }
    ];

    const createdJobs = await Job.insertMany(jobsData);
    console.log(`Created ${createdJobs.length} seed jobs.`);

    // 3. Create Sample Applications with diverse statuses
    const sampleApplications = [
      {
        applicant: candidateUser._id,
        job: createdJobs[0]._id, // Senior Full-Stack
        recruiter: recruiterTechNova._id,
        resume: "https://alexrivera-portfolio.dev/resume.pdf",
        coverLetter: "I have 5 years of full-stack engineering experience building high-throughput web applications with Node.js and React. I am thrilled by TechNova's vision and would love to contribute to your core architecture.",
        status: "shortlisted"
      },
      {
        applicant: candidateUser._id,
        job: createdJobs[1]._id, // Frontend Developer
        recruiter: recruiterTechNova._id,
        resume: "https://alexrivera-portfolio.dev/resume.pdf",
        coverLetter: "Passionate about modern UI design systems, performance, and accessibility. I've built multiple commercial design systems with React and TypeScript.",
        status: "reviewed"
      },
      {
        applicant: candidateUser._id,
        job: createdJobs[2]._id, // Cloud & DevOps
        recruiter: recruiterCloud._id,
        resume: "https://alexrivera-portfolio.dev/resume.pdf",
        coverLetter: "Excited by CloudScale's mission. I have managed multi-cluster Kubernetes deployments and automated zero-downtime releases.",
        status: "pending"
      },
      {
        applicant: sophiaUser._id,
        job: createdJobs[3]._id, // Backend API Engineer
        recruiter: recruiterCloud._id,
        resume: "https://sophia-chen.me/cv.pdf",
        coverLetter: "With 4 years building resilient microservices and distributed APIs with Node.js and PostgreSQL, I look forward to enhancing CloudScale's analytics services.",
        status: "accepted"
      }
    ];

    await Application.insertMany(sampleApplications);
    console.log(`Created ${sampleApplications.length} sample applications.`);

    console.log("\n=======================================================");
    console.log(" Database Seed Completed Successfully! ");
    console.log("=======================================================");
    console.log("Demo Accounts (Password for all: password123):");
    console.log(" • Candidate : candidate@worklix.com");
    console.log(" • Recruiter : recruiter@worklix.com");
    console.log(" • Admin     : admin@worklix.com");
    console.log("=======================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seedDatabase();
