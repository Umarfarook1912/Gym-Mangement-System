const { PLAN_STATUS, LIMITS } = require('../constants');
const { checkName, compactErrors } = require('./common');

const planSchema = ({ body }) => {
  const duration = Number(body.durationMonths);
  const price = Number(body.price);
  return compactErrors([
    checkName(body.name, 'name'),
    !Number.isInteger(duration) || duration < 1 ? { field: 'durationMonths', message: 'Duration must be at least 1 month' } : null,
    Number.isNaN(price) || price < 0 ? { field: 'price', message: 'Enter a valid price' } : null,
    body.status && !Object.values(PLAN_STATUS).includes(body.status)
      ? { field: 'status', message: 'Select a valid status' }
      : null,
    body.name && body.name.trim().length > LIMITS.NAME_MAX ? { field: 'name', message: 'Name is too long' } : null,
  ]);
};

module.exports = { planSchema };
