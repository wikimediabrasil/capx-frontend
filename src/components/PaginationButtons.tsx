import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import SimpleButton from '@/components/SimpleButton';

interface PaginationButtonsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

type PageItem = number | '...';

export function PaginationButtons({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationButtonsProps) {
  const { darkMode } = useTheme();
  const { pageContent } = useApp();

  // Function to generate array of pages to be shown
  const getPageNumbers = (): PageItem[] => {
    const pages: PageItem[] = [];
    const maxVisiblePages = 7; // Maximum number of visible buttons
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if close to the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis if necessary
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add pages in the middle
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page and ellipsis if necessary
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const buttonStyle = `
    px-3 py-2 rounded-lg transition-colors text-sm font-medium
    ${
      darkMode
        ? 'text-gray-200 hover:bg-gray-600 hover:text-white disabled:bg-gray-800 disabled:text-gray-500 border border-gray-600'
        : 'text-gray-700 hover:bg-gray-100 disabled:bg-gray-100 disabled:text-gray-400 border border-gray-300'
    }
  `;

  const activeButtonStyle = `
    ${buttonStyle}
    ${
      darkMode 
        ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' 
        : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700'
    }
  `;

  return (
    <div className="flex flex-col items-center gap-4 mt-6 mb-8">
      <div className="flex items-center gap-2">
        {/* First page button */}
        <SimpleButton
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          class_name={buttonStyle}
          aria-label={pageContent?.['pagination-first'] || 'Go to first page'}
        >
          &laquo;
        </SimpleButton>

        {/* Previous page button */}
        <SimpleButton
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          class_name={buttonStyle}
          aria-label={pageContent?.['pagination-previous'] || 'Go to previous page'}
        >
          &lsaquo;
        </SimpleButton>

        {/* Numbers of pages */}
        <div
          className="flex items-center gap-1 mx-2"
          role="group"
          aria-label={pageContent?.['pagination-pages'] || 'Page numbers'}
        >
          {getPageNumbers().map((page, index) =>
            typeof page === 'number' ? (
              <SimpleButton
                key={index}
                type="button"
                onClick={() => onPageChange(page)}
                class_name={page === currentPage ? activeButtonStyle : buttonStyle}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={
                  page === currentPage
                    ? pageContent?.['pagination-current-page']?.replace(
                        '{page}',
                        page.toString()
                      ) || `Current page, page ${page}`
                    : pageContent?.['pagination-go-to-page']?.replace('{page}', page.toString()) ||
                      `Go to page ${page}`
                }
              >
                {page}
              </SimpleButton>
            ) : (
              <span
                key={index}
                className={`px-2 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}
                aria-hidden="true"
              >
                {page}
              </span>
            )
          )}
        </div>

        {/* Next page button */}
        <SimpleButton
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          class_name={buttonStyle}
          aria-label={pageContent?.['pagination-next'] || 'Go to next page'}
        >
          &rsaquo;
        </SimpleButton>

        {/* Last page button */}
        <SimpleButton
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          class_name={buttonStyle}
          aria-label={pageContent?.['pagination-last'] || 'Go to last page'}
        >
          &raquo;
        </SimpleButton>
      </div>

      {/* Current page information */}
      <div className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}>
        {pageContent?.['pagination-page']} {currentPage} {pageContent?.['pagination-of']}{' '}
        {totalPages}
      </div>
    </div>
  );
}
