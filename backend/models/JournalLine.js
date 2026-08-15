const mongoose = require('mongoose');

const journalLineSchema = new mongoose.Schema({
  journalEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalEntry',
    required: true,
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChartOfAccount',
    required: true,
  },
  debit: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  description: {
    type: String,
  },
}, { timestamps: true });

// Validate that a line has EITHER debit or credit, not both, and not neither.
journalLineSchema.pre('save', function (next) {
  if (this.debit > 0 && this.credit > 0) {
    return next(new Error('Journal line cannot have both debit and credit.'));
  }
  if (this.debit === 0 && this.credit === 0) {
    return next(new Error('Journal line must have either debit or credit greater than 0.'));
  }
  next();
});

journalLineSchema.index({ journalEntryId: 1 });
journalLineSchema.index({ organizationId: 1, accountId: 1 });

module.exports = mongoose.model('JournalLine', journalLineSchema);
