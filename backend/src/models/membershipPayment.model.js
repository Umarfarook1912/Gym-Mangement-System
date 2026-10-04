const mongoose = require('mongoose');
const { LIMITS } = require('../constants');

const membershipPaymentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
      maxlength: LIMITS.NAME_MAX,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    paidOn: { type: String, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

membershipPaymentSchema.index({ member: 1, startDate: 1 }, { unique: true });

module.exports = mongoose.model('MembershipPayment', membershipPaymentSchema);
