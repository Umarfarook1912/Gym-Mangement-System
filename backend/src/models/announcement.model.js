const mongoose = require('mongoose');
const { ANNOUNCEMENT_TYPES, LIMITS } = require('../constants');

const announcementSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(ANNOUNCEMENT_TYPES),
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: LIMITS.TITLE_MAX,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: LIMITS.BODY_MAX,
    },
    sendEmail: { type: Boolean, default: false },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
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

module.exports = mongoose.model('Announcement', announcementSchema);
