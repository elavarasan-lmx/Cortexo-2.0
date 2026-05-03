/**
 * Pagination utilities for API list endpoints.
 * Supports both offset-based and cursor-based pagination.
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Parse pagination params from a request query string.
 * Defaults: page=1, limit=20, max limit=100.
 */
export function parsePagination(query: Record<string, unknown>): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(String(query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '20'), 10) || 20));
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Build a paginated response object.
 */
export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}
