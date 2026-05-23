/**
 * Validates query parameters and sheet data inputs
 */

const VALID_OPERATORS = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'contains', 'startsWith'];
const MAX_PAGE_SIZE = 1000;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE = 10000;

/**
 * Validates pagination parameters
 * @param {object} params - { page, pageSize }
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validatePagination({ page, pageSize } = {}) {
  const errors = [];

  if (page !== undefined) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1 || p > MAX_PAGE) {
      errors.push(`page must be an integer between 1 and ${MAX_PAGE}`);
    }
  }

  if (pageSize !== undefined) {
    const ps = Number(pageSize);
    if (!Number.isInteger(ps) || ps < MIN_PAGE_SIZE || ps > MAX_PAGE_SIZE) {
      errors.push(`pageSize must be an integer between ${MIN_PAGE_SIZE} and ${MAX_PAGE_SIZE}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a single filter param string like "age:gte:30"
 * @param {string} filterStr
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateFilterParam(filterStr) {
  const errors = [];

  if (typeof filterStr !== 'string' || !filterStr.trim()) {
    errors.push('filter must be a non-empty string');
    return { valid: false, errors };
  }

  const parts = filterStr.split(':');
  if (parts.length < 2 || parts.length > 3) {
    errors.push(`filter "${filterStr}" must follow format field:operator:value or field:value`);
    return { valid: false, errors };
  }

  if (parts.length === 3) {
    const operator = parts[1];
    if (!VALID_OPERATORS.includes(operator)) {
      errors.push(`unknown operator "${operator}", valid operators: ${VALID_OPERATORS.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates all query params from an API request
 * @param {object} query - express req.query
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateQueryParams(query = {}) {
  const errors = [];

  const paginationResult = validatePagination({ page: query.page, pageSize: query.pageSize });
  errors.push(...paginationResult.errors);

  const filters = Array.isArray(query.filter) ? query.filter : query.filter ? [query.filter] : [];
  for (const f of filters) {
    const filterResult = validateFilterParam(f);
    errors.push(...filterResult.errors);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = { validatePagination, validateFilterParam, validateQueryParams, VALID_OPERATORS };
