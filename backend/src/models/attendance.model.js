const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../constants');

const attendanceSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    dateKey: {
      type: String,
      required: true,
      index: true,
    },
    checkInAt: { type: Date, required: true },
    checkOutAt: { type: Date, default: null },
    status: {
      type: String,
      enum: [ATTENDANCE_STATUS.CHECKED_IN, ATTENDANCE_STATUS.CHECKED_OUT],
      default: ATTENDANCE_STATUS.CHECKED_IN,
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

attendanceSchema.index({ member: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
