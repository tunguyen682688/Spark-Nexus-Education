import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else if (currentPage <= 3) {
    for (let i = 1; i <= 5; i++) pages.push(i);
  } else if (currentPage >= totalPages - 2) {
    for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
  } else {
    for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        className="p-1 rounded border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
      {pages.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`w-6 h-6 rounded text-xs font-bold cursor-pointer ${
            currentPage === pageNumber ? 'bg-indigo-600 text-white' : 'hover:bg-secondary'
          }`}
        >
          {pageNumber}
        </button>
      ))}
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        className="p-1 rounded border border-border hover:bg-secondary disabled:opacity-40 cursor-pointer"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
