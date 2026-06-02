"use client";

import React from "react";

/**
 * Reusable pagination control for dashboard tables.
 *
 * Props:
 *  - currentPage   (number)  current 1-based page
 *  - totalPages    (number)  total number of pages
 *  - totalItems    (number)  total records (optional, for the summary text)
 *  - pageSize      (number)  current page size
 *  - onPageChange  (fn)      called with the next page number
 *  - onPageSizeChange (fn)   called with the next page size (optional — omit to hide selector)
 *  - pageSizeOptions (array) selectable page sizes (default [20, 50, 100])
 *  - disabled      (bool)    disable controls while loading
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  disabled = false,
}) => {
  const safeTotalPages = Math.max(1, totalPages || 1);
  const canPrev = currentPage > 1 && !disabled;
  const canNext = currentPage < safeTotalPages && !disabled;

  const rangeStart = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 my-6 px-3 text-xs sm:text-sm">
      {totalItems > 0 && (
        <span className="text-gray-600">
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </span>
      )}

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          Prev
        </button>
        <span className="whitespace-nowrap">
          Page {currentPage} of {safeTotalPages}
        </span>
        <button
          type="button"
          className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          Next
        </button>
      </div>

      {onPageSizeChange && (
        <label className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-gray-600">Rows</span>
          <select
            value={pageSize}
            disabled={disabled}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded px-2 py-1 outline-none disabled:opacity-50"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
};

export default Pagination;
