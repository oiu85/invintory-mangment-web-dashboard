import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';
import Breadcrumbs from './Breadcrumbs';

const PageHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  showBack = false,
  backPath,
  className = '',
  ...props
}) => {
  const navigate = useNavigate();
  
  return (
    <div className={`mb-8 ${className}`} {...props}>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {showBack && (
            <button
              onClick={() => backPath ? navigate(backPath) : navigate(-1)}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-neutral-600 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-wrap">
            {Array.isArray(actions) ? actions.map((action, index) => (
              <div key={index}>{action}</div>
            )) : actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
