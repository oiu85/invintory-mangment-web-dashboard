import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';

const Table = ({
  headers = [],
  data = [],
  renderRow,
  actions,
  sortable = false,
  loading = false,
  emptyMessage = 'No data available',
  emptyIcon,
  className = '',
  ...props
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  
  const handleSort = (key) => {
    if (!sortable) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    if (typeof aValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
  });
  
  const getSortIcon = (headerKey) => {
    if (!sortable || sortConfig.key !== headerKey) {
      return <ChevronsUpDown className="w-4 h-4 text-neutral-400" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary-600" />
    );
  };
  
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className={`min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-depth-sm ${className}`}>
          <thead className="bg-gradient-to-r from-primary-50/50 via-secondary-50/30 to-primary-50/50 dark:from-primary-900/20 dark:via-secondary-900/10 dark:to-primary-900/20 backdrop-blur-sm sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <Skeleton className="h-3.5 w-20" />
                </th>
              ))}
              {actions && <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
            {[...Array(5)].map((_, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-neutral-50/30 dark:bg-neutral-800/30' : ''}>
                {headers.map((_, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2.5">
                    <Skeleton className="h-3.5 w-full" />
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-2.5">
                    <Skeleton className="h-7 w-20" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-depth-sm overflow-hidden ${className}`} {...props}>
        <thead className="bg-gradient-to-r from-primary-50/50 via-secondary-50/30 to-primary-50/50 dark:from-primary-900/20 dark:via-secondary-900/10 dark:to-primary-900/20 backdrop-blur-sm sticky top-0 z-10 border-b-2 border-primary-200/50 dark:border-primary-700/50">
          <tr>
            {headers.map((header, index) => {
              const headerKey = typeof header === 'object' ? header.key : header;
              const headerLabel = typeof header === 'object' ? header.label : header;
              const isSortable = sortable && (typeof header === 'object' ? header.sortable !== false : true);
              
              return (
                <th
                  key={index}
                  className={`px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider transition-all duration-200 ${
                    isSortable ? 'cursor-pointer hover:bg-primary-100/50 dark:hover:bg-primary-800/30 select-none active:bg-primary-200/50 dark:active:bg-primary-700/40' : ''
                  }`}
                  onClick={() => isSortable && handleSort(headerKey)}
                  role={isSortable ? 'button' : undefined}
                  tabIndex={isSortable ? 0 : undefined}
                  onKeyDown={(e) => {
                    if (isSortable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleSort(headerKey);
                    }
                  }}
                  aria-sort={sortConfig.key === headerKey ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                >
                  <div className="flex items-center gap-2">
                    {headerLabel}
                    {isSortable && (
                      <span className="text-primary-500 dark:text-primary-400">
                        {getSortIcon(headerKey)}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
            {actions && (
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-700/60">
          {sortedData.length === 0 ? (
            <tr>
              <td colSpan={headers.length + (actions ? 1 : 0)} className="px-6 py-12">
                <EmptyState
                  icon={emptyIcon}
                  title={emptyMessage}
                  description="Try adjusting your filters or add new data."
                />
              </td>
            </tr>
          ) : (
            sortedData.map((row, index) => (
              <tr
                key={index}
                className={`transition-all duration-200 ${
                  index % 2 === 0 
                    ? 'bg-neutral-50/30 dark:bg-neutral-800/30' 
                    : 'bg-white dark:bg-neutral-800'
                } hover:bg-gradient-to-r hover:from-primary-50/40 hover:via-transparent hover:to-secondary-50/40 dark:hover:from-primary-900/20 dark:hover:via-transparent dark:hover:to-secondary-900/20 hover:shadow-sm`}
              >
                {renderRow(row)}
                {actions && (
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-1.5">
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
