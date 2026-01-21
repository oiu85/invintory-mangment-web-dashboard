import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Breadcrumbs = ({ items = [], className = '', ...props }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const Separator = isRTL ? ChevronRight : ChevronRight;
  
  if (items.length === 0) return null;
  
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center gap-2" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link
            to="/dashboard"
            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
            itemProp="item"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
            <Separator className="w-4 h-4 text-neutral-400 dark:text-neutral-500" aria-hidden="true" />
            {item.to ? (
              <Link
                to={item.to}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                itemProp="item"
              >
                <span itemProp="name">{item.label}</span>
              </Link>
            ) : (
              <span className="text-neutral-900 dark:text-neutral-100 font-medium" itemProp="name">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
