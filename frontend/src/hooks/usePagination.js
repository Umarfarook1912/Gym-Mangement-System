import { useState } from 'react';
import { PAGINATION } from '../constants';

export function usePagination() {
  const [page, setPage] = useState(PAGINATION.DEFAULT_PAGE);
  const limit = PAGINATION.DEFAULT_LIMIT;

  function resetPage() {
    setPage(PAGINATION.DEFAULT_PAGE);
  }

  return { page, setPage, limit, resetPage };
}
