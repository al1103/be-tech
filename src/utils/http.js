function asyncHandler(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

function parsePagination(query = {}) {
  const page = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.max(Number(query.pageSize || query.limit || 10), 1);
  const offset = (page - 1) * pageSize;

  return { page, pageSize, offset };
}

function toMeta({ page, pageSize, total }) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
}

module.exports = {
  asyncHandler,
  parsePagination,
  toMeta
};
