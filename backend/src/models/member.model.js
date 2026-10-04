const mongoose = require('mongoose');
const { LIMITS, GENDER, MEMBERSHIP_STATUS, ACCOUNT_STATUS } = require('../constants');
const { authFieldDefinitions, schemaOptions } = require('./shared');

const memberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: LIMITS.NAME_MIN,
      maxlength: LIMITS.NAME_MAX,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: LIMITS.EMAIL_MAX,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: { type: Date, required: true },
    gender: {
      type: String,
      enum: Object.values(GENDER),
      required: true,
    },
    address: {
      type: String,
      trim: true,
      default: '',
      maxlength: LIMITS.ADDRESS_MAX,
    },
    joinDate: { type: String, required: true },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      required: true,
    },
    membershipStartDate: { type: String, required: true },
    membershipEndDate: { type: String, required: true },
    membershipStatus: {
      type: String,
      enum: Object.values(MEMBERSHIP_STATUS),
      default: MEMBERSHIP_STATUS.ACTIVE,
      index: true,
    },
    emergencyContactName: { type: String, trim: true, default: '' },
    emergencyContactPhone: { type: String, trim: true, default: '' },
    height: { type: Number, default: null },
    weight: { type: Number, default: null },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    expiryReminderSentFor: { type: String, default: '' },
    ...authFieldDefinitions,
  },
  schemaOptions
);

module.exports = mongoose.model('Member', memberSchema);
