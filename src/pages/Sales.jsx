import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Search, ShoppingCart } from 'lucide-react';

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

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleSales')}
        subtitle={t('pageDescriptionSales')}
        actions={
          <Button icon={ShoppingCart} iconPosition="left" variant="ghost">
            {t('sales')}
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchSales')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        <Table
          headers={[
            { key: 'id', label: t('id'), sortable: true },
            { key: 'invoiceNumber', label: t('invoiceNumber'), sortable: true },
            { key: 'customer', label: t('customer'), sortable: true },
            { key: 'driver', label: t('driver') },
            { key: 'totalAmount', label: t('totalAmount'), sortable: true },
            { key: 'date', label: t('date'), sortable: true },
          ]}
          data={filteredSales}
          sortable={true}
          loading={loading}
          emptyMessage={t('noData')}
          renderRow={(sale) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{sale.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-mono font-semibold">{sale.invoice_number}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">{sale.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge variant="primary">{sale.driver?.name || t('nA')}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold text-success-600 dark:text-success-400">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {new Date(sale.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
            </>
          )}
          actions={(sale) => (
            <Button variant="ghost" size="sm" onClick={() => navigate(`/sales/${sale.id}`)}>
              {t('viewDetails')}
            </Button>
          )}
        />
      </Card>
    </div>
  );
};

export default Sales;
