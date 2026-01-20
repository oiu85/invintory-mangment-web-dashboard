import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const SaleDetails = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      const response = await axiosClient.get(`/sales/${id}`);
      setSale(response.data);
    } catch (error) {
      console.error('Error fetching sale details:', error);
      showToast(t('errorLoadingSales'), 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('saleNotFound')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{t('saleNotFoundMessage')}</p>
          <Button onClick={() => navigate('/sales')}>{t('backToSalesButton')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/sales')}>
          {t('backToSales')}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{t('pageTitleSaleDetails')}</h1>
          <span className="px-4 py-2 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full font-semibold">
            Invoice #{sale.invoice_number}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('invoiceNumber')}</p>
            <p className="text-lg font-semibold font-mono text-gray-900 dark:text-white">{sale.invoice_number}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('customerName')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{sale.customer_name}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('driver')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{sale.driver?.name || sale.driver_name || t('nA')}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalAmount')}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">${parseFloat(sale.total_amount).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('dateTime')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {new Date(sale.created_at).toLocaleString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">{t('items')}</h2>
        <div className="overflow-x-auto">
          <Table
            headers={[t('productName'), t('quantity'), t('unitPrice'), t('subtotal')]}
            data={sale.items || []}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{item.product_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full font-medium">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${parseFloat(item.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold text-green-600 dark:text-green-400">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </td>
              </>
            )}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('totalAmount')}</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">${parseFloat(sale.total_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
