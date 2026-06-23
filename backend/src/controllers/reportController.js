const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Project = require('../models/Project');
const Review = require('../models/Review');
const Evaluation = require('../models/Evaluation');
const Department = require('../models/Department');

// Export Excel Report
exports.exportExcelReport = async (req, res, next) => {
  const { type, departmentId } = req.query; // type: students, guides, projects, evaluations
  let filter = {};

  try {
    if (departmentId) {
      filter.departmentId = departmentId;
    }

    let dataToExport = [];
    let filename = 'report.xlsx';

    if (type === 'students') {
      const students = await Student.find(filter)
        .populate('departmentId', 'code')
        .populate('academicYearId', 'name')
        .populate('groupId', 'groupCode');

      dataToExport = students.map((s) => ({
        'Roll Number': s.rollNumber,
        'Enrollment Number': s.enrollmentNumber,
        'Name': s.name,
        'Division': s.division,
        'Batch': s.batch,
        'Email': s.email,
        'Mobile': s.mobile,
        'Department': s.departmentId ? s.departmentId.code : 'N/A',
        'Academic Year': s.academicYearId ? s.academicYearId.name : 'N/A',
        'Group Code': s.groupId ? s.groupId.groupCode : 'N/A',
      }));
      filename = 'Students_List.xlsx';
    } else if (type === 'guides') {
      const guides = await Faculty.find({ ...filter, roles: 'guide' })
        .populate('departmentId', 'code');

      dataToExport = guides.map((g) => ({
        'Name': g.name,
        'Designation': g.designation,
        'Email': g.email,
        'Mobile': g.mobile,
        'Specialization': g.specialization.join(', '),
        'Current Allocated Groups': g.allocatedGroupsCount,
        'Max Capacity': g.maxLoad,
        'Department': g.departmentId ? g.departmentId.code : 'N/A',
      }));
      filename = 'Faculty_Guides_Workload.xlsx';
    } else if (type === 'projects') {
      const projects = await Project.find()
        .populate({
          path: 'groupId',
          match: departmentId ? { departmentId } : {},
          populate: [
            { path: 'guideId', select: 'name' },
            { path: 'departmentId', select: 'code' },
          ],
        });

      // Filter out projects where groupId didn't match the department filter
      const filteredProjects = projects.filter((p) => p.groupId);

      dataToExport = filteredProjects.map((p) => ({
        'Project Title': p.title,
        'Domain': p.domain,
        'Technologies': p.technologies.join(', '),
        'Abstract': p.abstract.substring(0, 100) + '...',
        'Status': p.status,
        'Group Code': p.groupId.groupCode,
        'Assigned Guide': p.groupId.guideId ? p.groupId.guideId.name : 'Unassigned',
        'Department': p.groupId.departmentId ? p.groupId.departmentId.code : 'N/A',
      }));
      filename = 'Projects_List.xlsx';
    } else if (type === 'evaluations') {
      const evaluations = await Evaluation.find()
        .populate({
          path: 'groupId',
          match: departmentId ? { departmentId } : {},
          populate: [{ path: 'projectId', select: 'title' }, { path: 'departmentId', select: 'code' }],
        })
        .populate('evaluatedById', 'name');

      const filtered = evaluations.filter((e) => e.groupId);

      dataToExport = filtered.map((e) => ({
        'Group Code': e.groupId.groupCode,
        'Project Title': e.groupId.projectId ? e.groupId.projectId.title : 'N/A',
        'Innovation (10)': e.innovation,
        'Complexity (15)': e.technicalComplexity,
        'Design (15)': e.designQuality,
        'Implementation (20)': e.implementationQuality,
        'Documentation (15)': e.documentation,
        'Presentation (10)': e.presentation,
        'Viva (15)': e.vivaPerformance,
        'Total Score (100)': e.totalScore,
        'Evaluated By': e.evaluatedById ? e.evaluatedById.name : 'N/A',
        'Comments': e.comments,
      }));
      filename = 'Final_Evaluations_Grades.xlsx';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid report type requested' });
    }

    // Build Excel binary buffer using exceljs
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Report Data');

    if (dataToExport.length > 0) {
      const cols = Object.keys(dataToExport[0]).map((k) => ({ header: k, key: k }));
      ws.columns = cols;
      dataToExport.forEach((d) => ws.addRow(d));
    }

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(Buffer.from(buffer));
  } catch (error) {
    next(error);
  }
};

// Export PDF Report (compliance ready, e.g., NBA / NAAC)
exports.exportPDFReport = async (req, res, next) => {
  const { type, departmentId } = req.query;

  try {
    let deptName = 'All Departments';
    if (departmentId) {
      const dept = await Department.findById(departmentId);
      if (dept) deptName = dept.name;
    }

    const doc = new PDFDocument({ margin: 50 });
    let filename = 'report.pdf';

    if (type === 'guide_workload') {
      filename = 'Guide_Workload_Report.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      doc.pipe(res);

      // Title & Header
      doc.fontSize(20).text('Project Guide Workload & Allocation Report', { align: 'center' });
      doc.fontSize(10).text(`Department: ${deptName}`, { align: 'center' });
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Draw Table Header
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text('Faculty Name', 50, doc.y, { width: 150 });
      doc.text('Designation', 200, doc.y, { width: 120 });
      doc.text('Specialization', 320, doc.y, { width: 150 });
      doc.text('Load/Max', 470, doc.y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      // Query Guides
      const guidesFilter = departmentId ? { departmentId, roles: 'guide' } : { roles: 'guide' };
      const guides = await Faculty.find(guidesFilter);

      doc.fontSize(10).font('Helvetica');
      for (let g of guides) {
        if (doc.y > 700) doc.addPage();
        const startY = doc.y;
        doc.text(g.name, 50, startY, { width: 150 });
        doc.text(g.designation, 200, startY, { width: 120 });
        doc.text(g.specialization.slice(0, 3).join(', '), 320, startY, { width: 150 });
        doc.text(`${g.allocatedGroupsCount} / ${g.maxLoad}`, 470, startY, { width: 80, align: 'right' });
        doc.moveDown(1.5);
      }
      doc.end();
    } else if (type === 'evaluations') {
      filename = 'Student_Grades_Report.pdf';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      doc.pipe(res);

      doc.fontSize(20).text('Student Project Final Evaluation Report', { align: 'center' });
      doc.fontSize(10).text(`Department: ${deptName}`, { align: 'center' });
      doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Draw Table Header
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Group', 50, doc.y, { width: 80 });
      doc.text('Project Title', 130, doc.y, { width: 220 });
      doc.text('Viva', 350, doc.y, { width: 50, align: 'center' });
      doc.text('Doc', 400, doc.y, { width: 50, align: 'center' });
      doc.text('Total Score', 450, doc.y, { width: 100, align: 'right' });
      doc.moveDown(0.5);
      doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);

      const evaluations = await Evaluation.find()
        .populate({
          path: 'groupId',
          match: departmentId ? { departmentId } : {},
          populate: { path: 'projectId', select: 'title' },
        });

      const filtered = evaluations.filter((e) => e.groupId);

      doc.fontSize(9).font('Helvetica');
      for (let e of filtered) {
        if (doc.y > 700) doc.addPage();
        const startY = doc.y;
        doc.text(e.groupId.groupCode, 50, startY, { width: 80 });
        doc.text(e.groupId.projectId ? e.groupId.projectId.title : 'N/A', 130, startY, { width: 220 });
        doc.text(String(e.vivaPerformance), 350, startY, { width: 50, align: 'center' });
        doc.text(String(e.documentation), 400, startY, { width: 50, align: 'center' });
        doc.font('Helvetica-Bold').text(`${e.totalScore} / 100`, 450, startY, { width: 100, align: 'right' }).font('Helvetica');
        doc.moveDown(2);
      }
      doc.end();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid PDF report type requested' });
    }
  } catch (error) {
    next(error);
  }
};
