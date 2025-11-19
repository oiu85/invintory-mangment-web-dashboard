import { TrendingUp, TrendingDown } from 'lucide-react';

const Card = ({ title, value, icon: Icon, color = 'blue', trend, trendValue, subtitle }) => {
  const colorConfigs = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-500 dark:bg-blue-600',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-500 dark:bg-green-600',
      text: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-500 dark:bg-purple-600',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      iconBg: 'bg-orange-500 dark:bg-orange-600',
      text: 'text-orange-600 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconBg: 'bg-indigo-500 dark:bg-indigo-600',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
    },
  };

  const config = colorConfigs[color] || colorConfigs.blue;

  return (
    <div className={`bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border ${config.border} dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`${config.iconBg} dark:opacity-90 p-3 rounded-lg`}>
            {Icon && <Icon className="w-6 h-6 text-white" />}
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${config.text} mb-1`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card;
