const Faculty = require('../models/Faculty');
const Group = require('../models/Group');
const Student = require('../models/Student');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

// Get all guides with workload details
exports.getGuidesWorkload = async (req, res, next) => {
  try {
    const guides = await Faculty.find({ roles: 'guide' }).populate('departmentId', 'name code');
    
    // Calculate the number of groups assigned to each guide dynamically to ensure sync
    const workloadList = await Promise.all(
      guides.map(async (guide) => {
        const count = await Group.countDocuments({ guideId: guide._id });
        
        // Sync with allocatedGroupsCount in DB
        if (guide.allocatedGroupsCount !== count) {
          guide.allocatedGroupsCount = count;
          await guide.save();
        }

        return {
          _id: guide._id,
          name: guide.name,
          designation: guide.designation,
          email: guide.email,
          mobile: guide.mobile,
          specialization: guide.specialization,
          allocatedGroupsCount: count,
          maxLoad: guide.maxLoad,
          department: guide.departmentId,
        };
      })
    );

    res.status(200).json({ success: true, data: workloadList });
  } catch (error) {
    next(error);
  }
};

// Manually Allocate Guide
exports.allocateGuideManual = async (req, res, next) => {
  const { groupId, guideId } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const guide = await Faculty.findById(guideId);
    if (!guide) {
      return res.status(404).json({ success: false, message: 'Faculty/Guide not found' });
    }

    if (!guide.roles.includes('guide')) {
      return res.status(400).json({ success: false, message: 'Target faculty is not designated as a Guide' });
    }

    // Check workload capacity
    const currentLoad = await Group.countDocuments({ guideId: guide._id });
    if (currentLoad >= guide.maxLoad) {
      return res.status(400).json({
        success: false,
        message: `Guide '${guide.name}' has reached maximum workload capacity (${guide.maxLoad} groups)`,
      });
    }

    // If already has a guide, decrement their count first
    if (group.guideId) {
      const prevGuide = await Faculty.findById(group.guideId);
      if (prevGuide) {
        prevGuide.allocatedGroupsCount = Math.max(0, prevGuide.allocatedGroupsCount - 1);
        await prevGuide.save();
      }
    }

    // Allocate new guide
    group.guideId = guide._id;
    await group.save();

    guide.allocatedGroupsCount = currentLoad + 1;
    await guide.save();

    // Send notifications to group members
    const students = await Student.find({ groupId: group._id });
    for (let student of students) {
      await Notification.create({
        recipientId: student.userId,
        title: 'Project Guide Allocated',
        message: `Prof. ${guide.name} has been allocated as the guide for your group.`,
        type: 'success',
      });
    }

    // Notify Guide
    await Notification.create({
      recipientId: guide.userId,
      title: 'New Project Group Assigned',
      message: `Group '${group.groupCode}' has been allocated to you. Please check your dashboard.`,
      type: 'info',
    });

    res.status(200).json({
      success: true,
      message: `Guide Prof. ${guide.name} allocated to Group ${group.groupCode} successfully`,
      data: group,
    });
  } catch (error) {
    next(error);
  }
};

// Auto Allocate Guides
exports.allocateGuidesAuto = async (req, res, next) => {
  try {
    // 1. Get all unassigned groups
    const unassignedGroups = await Group.find({ guideId: null }).populate('projectId');
    
    if (unassignedGroups.length === 0) {
      return res.status(200).json({ success: true, message: 'All groups are already allocated' });
    }

    // 2. Fetch all guides and sync current workload count
    const guides = await Faculty.find({ roles: 'guide' });
    const guidesData = await Promise.all(
      guides.map(async (g) => {
        const count = await Group.countDocuments({ guideId: g._id });
        g.allocatedGroupsCount = count;
        await g.save();
        return g;
      })
    );

    let allocatedCount = 0;
    const allocationLog = [];

    // Loop through groups and match
    for (let group of unassignedGroups) {
      if (!group.projectId) {
        allocationLog.push(`Group ${group.groupCode}: Ignored (Project not registered yet)`);
        continue;
      }

      const project = group.projectId;
      const domain = project.domain; // e.g. "Artificial Intelligence"

      // Find eligible guides: load < maxLoad
      let eligibleGuides = guidesData.filter((g) => g.allocatedGroupsCount < g.maxLoad);

      if (eligibleGuides.length === 0) {
        allocationLog.push(`Group ${group.groupCode}: Failed (All guides are fully loaded)`);
        break;
      }

      // Try matching by Specialization
      let matchedGuides = eligibleGuides.filter((g) =>
        g.specialization.some((spec) => spec.toLowerCase().includes(domain.toLowerCase()) || domain.toLowerCase().includes(spec.toLowerCase()))
      );

      let selectedGuide = null;

      if (matchedGuides.length > 0) {
        // Pick guide with least workload
        matchedGuides.sort((a, b) => a.allocatedGroupsCount - b.allocatedGroupsCount);
        selectedGuide = matchedGuides[0];
      } else {
        // Fallback: Pick guide with overall least workload in department
        eligibleGuides.sort((a, b) => a.allocatedGroupsCount - b.allocatedGroupsCount);
        selectedGuide = eligibleGuides[0];
      }

      if (selectedGuide) {
        // Allocate
        group.guideId = selectedGuide._id;
        await group.save();

        selectedGuide.allocatedGroupsCount += 1;
        await selectedGuide.save();

        // Send notifications
        const students = await Student.find({ groupId: group._id });
        for (let student of students) {
          await Notification.create({
            recipientId: student.userId,
            title: 'Project Guide Allocated (Auto)',
            message: `Prof. ${selectedGuide.name} has been allocated as the guide for your group.`,
            type: 'success',
          });
        }

        await Notification.create({
          recipientId: selectedGuide.userId,
          title: 'New Group Allocated (Auto)',
          message: `Group '${group.groupCode}' has been allocated to you (Domain match: ${domain}).`,
          type: 'info',
        });

        allocatedCount++;
        allocationLog.push(`Group ${group.groupCode} -> Guide ${selectedGuide.name} (Matched Domain: ${domain})`);
      }
    }

    res.status(200).json({
      success: true,
      message: `Auto allocation completed. Allocated ${allocatedCount} groups.`,
      log: allocationLog,
    });
  } catch (error) {
    next(error);
  }
};
