import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen">
        <PageHeader
          title={t('pageTitleSaleDetails')}
          subtitle={t('loading')}
        />
        <Card variant="glass">
          <Card.Body>
            <div className="space-y-4">
              <Skeleton variant="title" />
              <Skeleton variant="text" />
              <Skeleton variant="text" />
              <Skeleton variant="text" className="w-3/4" />
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={t('pageTitleSaleDetails')}
          subtitle={t('saleNotFound')}
        />
        <EmptyState
          icon={AlertCircle}
          title={t('saleNotFound')}
          description={t('saleNotFoundMessage')}
          action={() => navigate('/sales')}
          actionLabel={t('backToSalesButton')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleSaleDetails')}
        subtitle={`${t('invoice')} #${sale.invoice_number}`}
        showBack
        backPath="/sales"
        actions={
          <Badge variant="success" size="lg">
            {t('invoice')} #{sale.invoice_number}
          </Badge>
        }
      />

      <Card variant="glass" className="mb-6">
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('invoiceNumber')}</p>
              <p className="text-lg font-semibold font-mono text-neutral-900 dark:text-white">{sale.invoice_number}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('customerName')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sale.customer_name}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('driver')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">{sale.driver?.name || sale.driver_name || t('nA')}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('totalAmount')}</p>
              <p className="text-2xl font-bold text-success-600 dark:text-success-400">${parseFloat(sale.total_amount).toFixed(2)}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-700/50 p-4 rounded-lg md:col-span-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">{t('dateTime')}</p>
              <p className="text-lg font-semibold text-neutral-900 dark:text-white">
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
        </Card.Body>
      </Card>

      <Card variant="glass">
        <Card.Header>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">{t('items')}</h2>
        </Card.Header>
        <Card.Body>
          <Table
            headers={[t('productName'), t('quantity'), t('unitPrice'), t('subtotal')]}
            data={sale.items || []}
            emptyMessage={t('noItems')}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{item.product_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  <Badge variant="primary">{item.quantity}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">${parseFloat(item.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold text-success-600 dark:text-success-400">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </td>
              </>
            )}
          />
        </Card.Body>
        <Card.Footer>
          <div className="flex justify-end w-full">
            <div className="text-right">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">{t('totalAmount')}</p>
              <p className="text-3xl font-bold text-success-600 dark:text-success-400">${parseFloat(sale.total_amount).toFixed(2)}</p>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default SaleDetails;
