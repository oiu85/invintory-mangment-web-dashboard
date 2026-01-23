import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Search, FileText, Download } from 'lucide-react';

const Invoices = () => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
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
      showToast(t('errorLoadingInvoices'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = async (sale) => {
    try {
      const response = await axiosClient.get(`/sales/${sale.id}`);
      setSelectedSale(response.data);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      showToast(t('errorLoadingInvoice'), 'error');
    }
  };

  const handleDownloadInvoice = async (saleId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = `${axiosClient.defaults.baseURL}/sales/${saleId}/invoice`;
      
      // Use axios to download PDF with proper headers
      const response = await axiosClient.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `invoice-${saleId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      showToast(t('invoiceDownloaded'), 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast(error.response?.data?.message || t('errorDownloadingInvoice'), 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleInvoices')}
        subtitle={t('pageDescriptionInvoices')}
        actions={
          <Button icon={FileText} iconPosition="left" variant="ghost">
            {t('invoices')}
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
            placeholder={t('searchInvoices')}
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
            { key: 'itemsCount', label: t('itemsCount'), sortable: true },
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
                <span className="font-mono font-semibold text-primary-600 dark:text-primary-400">{sale.invoice_number}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{sale.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge variant="primary">{sale.driver?.name || t('nA')}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold text-success-600 dark:text-success-400">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge>{sale.items?.length || 0} {t('items')}</Badge>
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
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(sale)}>
                {t('view')}
              </Button>
              <Button variant="success" size="sm" icon={Download} iconPosition="left" onClick={() => handleDownloadInvoice(sale.id)}>
                {t('downloadPdf')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/sales/${sale.id}`)}>
                {t('details')}
              </Button>
            </div>
          )}
        />
      </Card>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedSale(null);
        }}
        title={`${t('invoice')} ${selectedSale?.invoice_number || ''}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('invoice')}</h2>
                  <p className="text-gray-600 dark:text-gray-400">#{selectedSale.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('date')}</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(selectedSale.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer & Driver Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('customer')}</h3>
                <p className="text-gray-900 dark:text-white">{selectedSale.customer_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('driver')}</h3>
                <p className="text-gray-900 dark:text-white">{selectedSale.driver?.name || selectedSale.driver_name || t('nA')}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">{t('items')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">{t('product')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">{t('quantity')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">{t('unitPrice')}</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">{t('subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {selectedSale.items?.map((item, index) => (
                      <tr key={index} className="bg-white dark:bg-gray-800">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">${parseFloat(item.price).toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 font-semibold">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('totalAmount')}</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    ${parseFloat(selectedSale.total_amount).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="success"
                onClick={() => handleDownloadInvoice(selectedSale.sale_id || selectedSale.id)}
                className="flex-1"
              >
                {t('downloadPdfInvoice')}
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/sales/${selectedSale.sale_id || selectedSale.id}`)}
                className="flex-1"
              >
                {t('viewFullDetails')}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;

