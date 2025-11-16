
'use client';

import { useState, useMemo } from 'react';

export function usePagination<T>(data: T[], itemsPerPage: number) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);
  
  // Reset to page 1 if filters change and current page is out of bounds
  if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
  }

  return {
    currentPage,
    setCurrentPage,
    paginatedData,
    totalPages,
    totalItems: data.length,
  };
}

    