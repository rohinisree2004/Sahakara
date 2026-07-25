const Inquiry = require('../models/Inquiry');

// @desc    Submit a new society inquiry or registration request
// @route   POST /api/v1/landing/inquiry
// @access  Public
exports.submitInquiry = async (req, res, next) => {
  try {
    const {
      societyName,
      registrationNumber,
      contactPerson,
      designation,
      email,
      phone,
      estimatedMembers,
      societyType,
      state,
      message,
    } = req.body;

    if (!societyName || !contactPerson || !email || !phone || !state) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all mandatory fields (Society Name, Contact Person, Email, Phone, State).',
      });
    }

    const inquiry = await Inquiry.create({
      societyName,
      registrationNumber,
      contactPerson,
      designation,
      email,
      phone,
      estimatedMembers,
      societyType,
      state,
      message,
    });

    return res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully! Our Super Admin team will contact you shortly.',
      data: inquiry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system highlights and stats for the landing page
// @route   GET /api/v1/landing/stats
// @access  Public
exports.getLandingStats = async (req, res, next) => {
  try {
    const pendingInquiriesCount = await Inquiry.countDocuments({ status: 'Pending' });
    const orgCount = await require('../models/Organization').countDocuments({ status: 'Active', isDeleted: false });
    const memberCount = await require('../models/Member').countDocuments({});
    
    const SavingsAccount = require('../models/SavingsAccount');
    const Loan = require('../models/Loan');

    const savingsAggr = await SavingsAccount.aggregate([{ $group: { _id: null, count: { $sum: 1 } } }]);
    const loansAggr = await Loan.aggregate([
      { $match: { status: 'Disbursed' } }, 
      { $group: { _id: null, total: { $sum: "$approvedAmount" } } }
    ]);

    const stats = {
      activeSocieties: orgCount,
      totalMembersServed: memberCount,
      totalTransactionsProcessed: 0,
      savingsAccountsManaged: savingsAggr.length > 0 ? savingsAggr[0].count : 0,
      loanDisbursed: loansAggr.length > 0 ? `₹ ${loansAggr[0].total.toLocaleString()}` : 0,
      systemUptime: '99.98%',
      pendingInquiriesCount,
    };

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
