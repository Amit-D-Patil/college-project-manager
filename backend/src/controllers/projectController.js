const Project = require('../models/Project');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');

// Local database of project idea suggestions by domain
const DOMAIN_SUGGESTIONS = {
  'Artificial Intelligence': [
    { title: 'AI-Powered Smart Campus Navigation', desc: 'A 3D campus routing assistant that uses visual cues and A* navigation.' },
    { title: 'Intelligent Crop Disease Detection', desc: 'Predict and diagnose crop disease from leaf images with remediation advice.' },
    { title: 'Personalized AI Learning Companion', desc: 'A system that assesses student performance and synthesizes mock study paths.' }
  ],
  'Machine Learning': [
    { title: 'Predictive University Resource Allocation', desc: 'Optimize classroom, faculty, and lab allocation using legacy enrollment trends.' },
    { title: 'Student Dropout Risk Predictor', desc: 'Early warning system analyzing grade trends, attendance, and LMS logins.' },
    { title: 'Automated Resume Screening ERP', desc: 'Matches student resumes to recruiter job descriptions using semantic scoring.' }
  ],
  'Data Science': [
    { title: 'City-wide Traffic Jam Forecaster', desc: 'Analyze real-time traffic density sensor data to optimize traffic lights.' },
    { title: 'Placement Analytics Dashboard', desc: 'Visual analytics tool summarizing historical placement trends and salary brackets.' },
    { title: 'Automated Student Feedback Analyzer', desc: 'Performs sentiment analysis on student feedback to highlight core pain points.' }
  ],
  'IoT': [
    { title: 'Smart Grid Energy Auditor', desc: 'Real-time monitoring of campus electrical lines with predictive leakage alerts.' },
    { title: 'Automated Attendance via BLE Beacon', desc: 'Track student attendance automatically as they enter the classroom radius.' },
    { title: 'Air Quality & Environmental Monitor', desc: 'Solar-powered sensors mapping campus pollution index maps in real time.' }
  ],
  'Cyber Security': [
    { title: 'Zero-Trust Campus File-Sharing Network', desc: 'Share files with double-layer verification and automated access expiration.' },
    { title: 'Intrusion Detection System via Log Analysis', desc: 'Identify unusual SSH login attempts on university servers using anomaly detection.' },
    { title: 'Phishing Simulation & Awareness Tool', desc: 'Launches mock tests to gauge student vulnerability to social engineering.' }
  ],
  'Blockchain': [
    { title: 'Decentralized Degree Verification Ledger', desc: 'Issues verifiable academic transcripts and degrees on a public blockchain.' },
    { title: 'Tamper-proof Student Voting Platform', desc: 'A secure, anonymous voting interface for student council elections.' },
    { title: 'Micro-Payment Smart Wallet for Cafeteria', desc: 'Handles campus transactions with smart contract billing logic.' }
  ],
  'Cloud Computing': [
    { title: 'Serverless Video Transcoding Service', desc: 'Converts student-uploaded lecture streams into multiple bitrates on demand.' },
    { title: 'Dynamic Multi-tenant Exam Platform', desc: 'Launches sandboxed coding environments that scale dynamically.' },
    { title: 'Hybrid Cloud Backup Coordinator', desc: 'Automated synchronization of departmental research labs to multiple clouds.' }
  ],
  'Mobile Development': [
    { title: 'Campus Emergency SOS Application', desc: 'One-click alert system sending location coordinates to campus security.' },
    { title: 'Student Peer-to-Peer Marketplace', desc: 'Rent/buy books, calculators, and lab coats within the student community.' },
    { title: 'Off-campus Accommodation Locator', desc: 'Directory matching students to vetted host hostels and roommates.' }
  ],
  'Web Technologies': [
    { title: 'Complete University Event Board', desc: 'Real-time interactive calendar with registrations, ticketing, and check-ins.' },
    { title: 'Alumni Directory & Mentorship Hub', desc: 'Enables chat rooms, guest lectures scheduling, and alumni messaging boards.' },
    { title: 'Interactive Laboratory Inventory ERP', desc: 'Tracks components, chemicals, and equipment bookings for research labs.' }
  ],
  'Computer Vision': [
    { title: 'Automated Exam Proctoring Software', desc: 'Uses webcam feeds to detect multiple faces, phone usage, or gaze deviations.' },
    { title: 'Smart Parking Lot Space Finder', desc: 'Scans CCTV camera feeds to map empty car parking spaces in real time.' },
    { title: 'Sign Language Translator Web App', desc: 'Converts hand gestures captured on camera to text and spoken audio.' }
  ],
  'Robotics': [
    { title: 'Autonomous Library Book Classifier', desc: 'A robot scanning RFID tags to identify misplaced books on library shelves.' },
    { title: 'Autonomous Classroom Cleaning Assistant', desc: 'Path-finding vacuum robot optimizing cleaning sweeps for university layouts.' },
    { title: 'Gesture Controlled Robotic Arm for Labs', desc: 'Facilitates handling hazardous materials in chemistry labs remotely.' }
  ],
  'AR/VR': [
    { title: 'Virtual Reality Chemistry Sandbox', desc: 'Conduct simulated, high-risk chemistry experiments in an immersive environment.' },
    { title: 'Augmented Reality Engineering Assembly Guide', desc: 'Overlays repair instructions and 3D diagrams on machine components.' },
    { title: 'Virtual Campus Virtual Tour', desc: 'A WebVR simulation allowing remote students to walk around the department.' }
  ]
};

// Register/Submit Project Proposal
exports.registerProject = async (req, res, next) => {
  const { title, problemStatement, objectives, domain, technologies, abstract, expectedOutcome, preferences } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.groupId) {
      return res.status(400).json({ success: false, message: 'You must belong to a group to register a project' });
    }

    const group = await Group.findById(student.groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Validate Minimum Group Members
    if (group.members.length < 3) {
      return res.status(400).json({
        success: false,
        message: `Group '${group.groupCode}' must have at least 3 members to register a project. Current members: ${group.members.length}`,
      });
    }

    let project;

    if (group.projectId) {
      // Update existing project details
      project = await Project.findById(group.projectId);
      if (project.status === 'approved') {
        return res.status(400).json({ success: false, message: 'Approved projects cannot be modified. Contact coordinator.' });
      }

      project.title = title;
      project.problemStatement = problemStatement;
      project.objectives = objectives;
      project.domain = domain;
      project.technologies = technologies;
      project.abstract = abstract;
      project.expectedOutcome = expectedOutcome;
      project.preferences = preferences;
      project.status = 'submitted'; // Reset back to submitted for review
      await project.save();
    } else {
      // Create new project
      project = await Project.create({
        title,
        problemStatement,
        objectives,
        domain,
        technologies,
        abstract,
        expectedOutcome,
        preferences,
        groupId: group._id,
        status: 'submitted',
      });

      group.projectId = project._id;
      await group.save();
    }

    res.status(200).json({
      success: true,
      message: 'Project registered successfully and sent for approval',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Get My Project Details
exports.getMyProject = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.groupId) {
      return res.status(200).json({ success: true, hasProject: false });
    }

    const group = await Group.findById(student.groupId);
    if (!group.projectId) {
      return res.status(200).json({ success: true, hasProject: false });
    }

    const project = await Project.findById(group.projectId);
    res.status(200).json({ success: true, hasProject: true, data: project });
  } catch (error) {
    next(error);
  }
};

// Get AI Suggestions by Domain
exports.getSuggestions = async (req, res, next) => {
  const { domain } = req.query;

  try {
    if (!domain) {
      return res.status(400).json({ success: false, message: 'Please provide a domain query parameter' });
    }

    const suggestions = DOMAIN_SUGGESTIONS[domain] || [];
    res.status(200).json({ success: true, domain, data: suggestions });
  } catch (error) {
    next(error);
  }
};

// Get All Projects (For Coordinators, HOD, Principal)
exports.getAllProjects = async (req, res, next) => {
  try {
    const projects = await Project.find()
      .populate({
        path: 'groupId',
        populate: [
          { path: 'members', select: 'name rollNumber email mobile division batch' },
          { path: 'guideId', select: 'name designation email' },
          { path: 'departmentId', select: 'name code' },
        ],
      });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

// Approve or Reject Project Registration
exports.updateProjectStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, comment } = req.body; // 'approved', 'rejected', 'revision_requested'

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.status = status;
    project.comment = comment || '';
    await project.save();

    res.status(200).json({
      success: true,
      message: `Project registration status updated to: ${status}`,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Submit Final Deliverables
exports.submitFinalProject = async (req, res, next) => {
  const { githubLink, gitlabLink, liveUrl, videoUrl } = req.body;

  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.groupId) {
      return res.status(400).json({ success: false, message: 'You must belong to a group to submit final deliverables' });
    }

    const group = await Group.findById(student.groupId);
    if (!group.projectId) {
      return res.status(400).json({ success: false, message: 'Your group has not registered any project' });
    }

    const project = await Project.findById(group.projectId);

    // Read uploaded files if any
    const finalSubmission = {
      githubLink,
      gitlabLink,
      liveUrl,
      videoUrl,
      submittedAt: new Date(),
      status: 'pending',
      guideApproval: false,
      coordinatorApproval: false,
    };

    if (req.files) {
      if (req.files.report) {
        finalSubmission.reportUrl = `/uploads/${req.files.report[0].filename}`;
        finalSubmission.reportName = req.files.report[0].originalname;
      }
      if (req.files.sourceCode) {
        finalSubmission.sourceCodeUrl = `/uploads/${req.files.sourceCode[0].filename}`;
        finalSubmission.sourceCodeName = req.files.sourceCode[0].originalname;
      }
      if (req.files.researchPaper) {
        finalSubmission.researchPaperUrl = `/uploads/${req.files.researchPaper[0].filename}`;
        finalSubmission.researchPaperName = req.files.researchPaper[0].originalname;
      }
      if (req.files.presentation) {
        finalSubmission.presentationUrl = `/uploads/${req.files.presentation[0].filename}`;
        finalSubmission.presentationName = req.files.presentation[0].originalname;
      }
    }

    // Preserve existing URLs if files were not uploaded in this session
    if (!finalSubmission.reportUrl && project.finalSubmission?.reportUrl) {
      finalSubmission.reportUrl = project.finalSubmission.reportUrl;
      finalSubmission.reportName = project.finalSubmission.reportName;
    }
    if (!finalSubmission.sourceCodeUrl && project.finalSubmission?.sourceCodeUrl) {
      finalSubmission.sourceCodeUrl = project.finalSubmission.sourceCodeUrl;
      finalSubmission.sourceCodeName = project.finalSubmission.sourceCodeName;
    }
    if (!finalSubmission.researchPaperUrl && project.finalSubmission?.researchPaperUrl) {
      finalSubmission.researchPaperUrl = project.finalSubmission.researchPaperUrl;
      finalSubmission.researchPaperName = project.finalSubmission.researchPaperName;
    }
    if (!finalSubmission.presentationUrl && project.finalSubmission?.presentationUrl) {
      finalSubmission.presentationUrl = project.finalSubmission.presentationUrl;
      finalSubmission.presentationName = project.finalSubmission.presentationName;
    }

    project.finalSubmission = finalSubmission;
    await project.save();

    res.status(200).json({
      success: true,
      message: 'Final deliverables submitted successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// Guide approval for Final Submission
exports.approveFinalByGuide = async (req, res, next) => {
  const { id } = req.params; // project ID
  const { status } = req.body; // 'approved' or 'rejected'

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.finalSubmission || !project.finalSubmission.submittedAt) {
      return res.status(400).json({ success: false, message: 'No final submission exists for this project' });
    }

    project.finalSubmission.guideApproval = status === 'approved';
    if (status === 'rejected') {
      project.finalSubmission.status = 'rejected';
    } else if (project.finalSubmission.coordinatorApproval) {
      project.finalSubmission.status = 'approved';
    }

    await project.save();
    res.status(200).json({ success: true, message: `Guide final review recorded: ${status}`, data: project });
  } catch (error) {
    next(error);
  }
};

// Coordinator approval for Final Submission
exports.approveFinalByCoordinator = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (!project.finalSubmission || !project.finalSubmission.submittedAt) {
      return res.status(400).json({ success: false, message: 'No final submission exists for this project' });
    }

    project.finalSubmission.coordinatorApproval = status === 'approved';
    if (status === 'rejected') {
      project.finalSubmission.status = 'rejected';
    } else if (project.finalSubmission.guideApproval) {
      project.finalSubmission.status = 'approved';
    }

    await project.save();
    res.status(200).json({ success: true, message: `Coordinator final review recorded: ${status}`, data: project });
  } catch (error) {
    next(error);
  }
};
