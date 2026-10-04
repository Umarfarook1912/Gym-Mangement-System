const mongoose = require('mongoose');
const { DEFAULT_GYM_NAME, DEFAULT_GYM_HOURS, WORKING_DAYS } = require('../constants');

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: DEFAULT_GYM_NAME, trim: true },
    openTime: { type: String, default: DEFAULT_GYM_HOURS.openTime },
    closeTime: { type: String, default: DEFAULT_GYM_HOURS.closeTime },
    workingDays: { type: [Number], default: WORKING_DAYS },
    checkoutRequired: { type: Boolean, default: true },
    memberSequence: { type: Number, default: 0 },
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

module.exports = mongoose.model('GymSettings', gymSettingsSchema);
