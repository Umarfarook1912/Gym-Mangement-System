const mongoose = require('mongoose');
const { LIMITS, ACCOUNT_STATUS } = require('../constants');
const { authFieldDefinitions, schemaOptions } = require('./shared');

const adminSchema = new mongoose.Schema(
  {
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
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(ACCOUNT_STATUS),
      default: ACCOUNT_STATUS.ACTIVE,
    },
    ...authFieldDefinitions,
  },
  schemaOptions
);

module.exports = mongoose.model('Admin', adminSchema);
