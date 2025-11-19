import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500 dark:bg-green-600',
    error: 'bg-red-500 dark:bg-red-600',
    warning: 'bg-yellow-500 dark:bg-yellow-600',
    info: 'bg-blue-500 dark:bg-blue-600',
  };

  return (
    <div className={`fixed top-4 right-4 ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 min-w-[300px] animate-slide-in dark:shadow-xl`}>
      <span className="font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-white hover:text-gray-200 dark:hover:text-gray-100 text-xl font-bold transition"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
