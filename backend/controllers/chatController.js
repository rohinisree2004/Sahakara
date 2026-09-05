const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const RoleAssignment = require('../models/RoleAssignment');
const Group = require('../models/Group');

// @desc    Get Chat Contacts
// @route   GET /api/v1/chat/contacts
// @access  Private
exports.getChatContacts = async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const currentUserRole = req.user.role;

    const assignmentFilter = { status: 'Active' };
    if (orgId) assignmentFilter.organizationId = orgId;
    
    // Role-specific scoping for chat contacts
    if (currentUserRole === 'Member') {
      assignmentFilter.role = { $in: ['Organization Admin', 'Branch Manager', 'President', 'Secretary', 'Treasurer', 'Employee'] };
    }

    const assignments = await RoleAssignment.find(assignmentFilter)
      .populate('branchId', 'branchName branchCode')
      .populate('organizationId', 'name');

    const contactUserIds = assignments
      .map(a => a.userId)
      .filter(id => id.toString() !== req.user._id.toString());

    const rawUsers = await User.find({ _id: { $in: contactUserIds }, isActive: true, isDeleted: false })
      .select('name username email phone')
      .limit(50);

    const contacts = rawUsers.map(u => {
      const uObj = u.toObject();
      const myAsgn = assignments.find(a => a.userId.toString() === u._id.toString());
      uObj.role = myAsgn?.role || 'Member';
      uObj.branchId = myAsgn?.branchId || null;
      return uObj;
    });

    // Also get Groups the user is associated with
    let groupsQuery = { organizationId: orgId, isDeleted: false };
    if (req.user.branchId && !['Super Admin', 'Organization Admin'].includes(currentUserRole)) {
      groupsQuery.branchId = req.user.branchId;
    }

    const groups = await Group.find(groupsQuery).select('groupName groupCode groupType').limit(30);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        groups,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get Messages between users or for a group
// @route   GET /api/v1/chat/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { contactId, groupId } = req.query;
    const currentUserId = req.user._id;

    let query = { organizationId: req.user.organizationId };

    if (groupId) {
      query.groupId = groupId;
    } else if (contactId) {
      query.$or = [
        { senderId: currentUserId, receiverId: contactId },
        { senderId: contactId, receiverId: currentUserId },
      ];
    } else {
      return res.status(400).json({ success: false, error: 'Please specify contactId or groupId.' });
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(100);

    // Mark unread messages as read
    if (contactId) {
      await ChatMessage.updateMany(
        { senderId: contactId, receiverId: currentUserId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    }

    res.status(200).json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Send a Chat Message
// @route   POST /api/v1/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, groupId, message } = req.body;

    if (!message || (!receiverId && !groupId)) {
      return res.status(400).json({ success: false, error: 'Message and recipient/group are required.' });
    }

    const newMsg = await ChatMessage.create({
      organizationId: req.user.organizationId,
      senderId: req.user._id,
      senderName: req.user.name,
      senderRole: req.user.role,
      receiverId: receiverId || null,
      groupId: groupId || null,
      message,
    });

    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
