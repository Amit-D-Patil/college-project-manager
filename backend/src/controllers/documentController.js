const Document = require('../models/Document');
const Student = require('../models/Student');
const Group = require('../models/Group');
const Faculty = require('../models/Faculty');
const Notification = require('../models/Notification');

// Upload Document Version
exports.uploadDocument = async (req, res, next) => {
  const { title, type } = req.body; // type: SRS, synopsis, design, etc.

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student || !student.groupId) {
      return res.status(400).json({ success: false, message: 'You must belong to a group to upload files' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;

    // Check if document of this type already exists for this group
    let document = await Document.findOne({ groupId: student.groupId, type });

    if (document) {
      // Store current document state to history
      document.versionHistory.push({
        version: document.version,
        fileUrl: document.fileUrl,
        fileName: document.fileName,
        uploadedById: document.uploadedById,
        status: document.status,
        remarks: document.remarks,
        createdAt: document.updatedAt,
      });

      // Update current document with new version details
      document.version += 1;
      document.fileUrl = fileUrl;
      document.fileName = fileName;
      document.uploadedById = req.user._id;
      document.status = 'pending'; // Reset status to pending review
      document.remarks = '';
      
      await document.save();
    } else {
      // Create new document
      document = await Document.create({
        groupId: student.groupId,
        title,
        type,
        version: 1,
        fileUrl,
        fileName,
        uploadedById: req.user._id,
        status: 'pending',
      });
    }

    // Notify Guide
    const group = await Group.findById(student.groupId);
    if (group && group.guideId) {
      const guide = await Faculty.findById(group.guideId);
      if (guide) {
        await Notification.create({
          recipientId: guide.userId,
          title: 'New Document Uploaded',
          message: `Group '${group.groupCode}' uploaded a new version of: "${type.toUpperCase()}".`,
          type: 'info',
        });
      }
    }

    res.status(200).json({ success: true, message: 'Document uploaded successfully', data: document });
  } catch (error) {
    next(error);
  }
};

// Get Group Documents
exports.getGroupDocuments = async (req, res, next) => {
  const { groupId } = req.params;

  try {
    const documents = await Document.find({ groupId })
      .populate('uploadedById', 'email')
      .sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
};

// Review Document Status (Guide)
exports.updateDocumentStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body; // 'approved', 'rejected', 'revision_requested'

  try {
    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const group = await Group.findById(document.groupId);
    const faculty = await Faculty.findOne({ userId: req.user._id });

    if (!group.guideId.equals(faculty._id)) {
      return res.status(403).json({ success: false, message: 'You are not the assigned guide for this group' });
    }

    document.status = status;
    document.remarks = remarks || '';
    await document.save();

    // Notify students
    const students = await Student.find({ groupId: document.groupId });
    for (let student of students) {
      await Notification.create({
        recipientId: student.userId,
        title: status === 'approved' ? 'Document Approved' : 'Document Rejected/Revision Required',
        message: `Prof. ${faculty.name} updated status on "${document.type.toUpperCase()}" to: ${status}. Remarks: ${remarks || 'None'}`,
        type: status === 'approved' ? 'success' : 'warning',
      });
    }

    res.status(200).json({ success: true, message: `Document status updated to: ${status}`, data: document });
  } catch (error) {
    next(error);
  }
};
