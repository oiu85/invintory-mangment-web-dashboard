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
        <table className={`min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
          <thead className="bg-neutral-50 dark:bg-neutral-900">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <Skeleton className="h-4 w-20" />
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {[...Array(5)].map((_, index) => (
              <tr key={index}>
                {headers.map((_, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4">
                    <Skeleton className="h-8 w-20" />
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
      <table className={`min-w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`} {...props}>
        <thead className="bg-neutral-50 dark:bg-neutral-900">
          <tr>
            {headers.map((header, index) => {
              const headerKey = typeof header === 'object' ? header.key : header;
              const headerLabel = typeof header === 'object' ? header.label : header;
              const isSortable = sortable && (typeof header === 'object' ? header.sortable !== false : true);
              
              return (
                <th
                  key={index}
                  className={`px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase tracking-wider ${
                    isSortable ? 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 select-none' : ''
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
                    {isSortable && getSortIcon(headerKey)}
                  </div>
                </th>
              );
            })}
            {actions && (
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-700 dark:text-neutral-300 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
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
                className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                {renderRow(row)}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-2">
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
