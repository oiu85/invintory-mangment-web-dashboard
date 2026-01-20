import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const Sales = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSales();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sales.filter(sale =>
        sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.driver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSales(filtered);
    } else {
      setFilteredSales(sales);
    }
  }, [searchTerm, sales]);

  const fetchSales = async () => {
    try {
      const response = await axiosClient.get('/admin/sales');
      setSales(response.data);
      setFilteredSales(response.data);
    } catch (error) {
      console.error('Error fetching sales:', error);
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

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleSales')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionSales')}</p>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchSales')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table
          headers={[t('id'), t('invoiceNumber'), t('customer'), t('driver'), t('totalAmount'), t('date')]}
          data={filteredSales}
          renderRow={(sale) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sale.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-mono font-semibold">{sale.invoice_number}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{sale.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {sale.driver?.name || t('nA')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-green-600 dark:text-green-400">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(sale.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
            </>
          )}
          actions={(sale) => (
            <Button variant="secondary" onClick={() => navigate(`/sales/${sale.id}`)}>
              {t('viewDetails')}
            </Button>
          )}
        />
      </div>
    </div>
  );
};

export default Sales;
