const AppError = require('../utils/AppError');
const { HTTP_STATUS, MESSAGES } = require('../constants');

function validate(schema) {
  return (req, _res, next) => {
    const errors = schema({ body: req.body, query: req.query, params: req.params });
    if (errors.length) {
      next(new AppError(MESSAGES.VALIDATION_FAILED, HTTP_STATUS.UNPROCESSABLE, errors));
      return;
    }
    next();
  };
}

module.exports = validate;
