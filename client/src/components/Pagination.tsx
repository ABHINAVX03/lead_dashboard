import React from 'react';
import { PaginationData } from '../types';

interface PaginationProps {
  pagination: PaginationData;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, pages } = pagination;

  const getPageNumbers = (): Array<number | '...'> => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: Array<number | '...'> = [];
    let lastPage: number | undefined;

    for (let i = 1; i <= pages; i++) {
      if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (lastPage) {
        if (i - lastPage === 2) rangeWithDots.push(lastPage + 1);
        else if (i - lastPage !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      lastPage = i;
    });

    return rangeWithDots;
  };

  if (pages <= 1) return null;

  return (
    <div className="flex justify-center mt-6">
      <nav className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Previous
        </button>
        {getPageNumbers().map((item, index) => (
          <button
            key={index}
            onClick={() => typeof item === 'number' && onPageChange(item)}
            className={`px-3 py-1 rounded-md ${
              item === page
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            } ${typeof item !== 'number' ? 'cursor-default' : ''}`}
            disabled={typeof item !== 'number'}
          >
            {item}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Next
        </button>
      </nav>
    </div>
  );
};
