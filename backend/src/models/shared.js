const authFieldDefinitions = {
  password: { type: String, required: true, select: false },
  resetPasswordTokenHash: { type: String, select: false },
  resetPasswordExpires: { type: Date, select: false },
};

function stripSensitive(_doc, ret) {
  delete ret.password;
  delete ret.resetPasswordTokenHash;
  delete ret.resetPasswordExpires;
  delete ret.__v;
  return ret;
}

const schemaOptions = {
  timestamps: true,
  toJSON: { virtuals: true, transform: stripSensitive },
  toObject: { virtuals: true, transform: stripSensitive },
};

module.exports = { authFieldDefinitions, schemaOptions, stripSensitive };
