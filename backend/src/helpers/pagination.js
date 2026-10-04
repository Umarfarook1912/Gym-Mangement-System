const { PAGINATION } = require('../constants');

function getPagination(query = {}) {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isNaN(parsedPage) ? PAGINATION.DEFAULT_PAGE : Math.max(parsedPage, PAGINATION.DEFAULT_PAGE);
  const limit = Number.isNaN(parsedLimit)
    ? PAGINATION.DEFAULT_LIMIT
    : Math.min(Math.max(parsedLimit, 1), PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function buildPagedResult({ items, total, page, limit }) {
  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

module.exports = { getPagination, buildPagedResult };
