import { useState } from 'react';

export const usePagination = (initial = { page: 1, limit: 10 }) => {
  const [page, setPage] = useState(initial.page);
  const [limit, setLimit] = useState(initial.limit);

  return {
    page,
    limit,
    setPage,
    setLimit,
    offset: (page - 1) * limit,
  };
};

export default usePagination;
