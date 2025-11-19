import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';

const Invoices = () => {
  const { showToast } = useToast();
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
      showToast('Error loading invoices', 'error');
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
      showToast('Error loading invoice', 'error');
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
      
      showToast('Invoice downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      showToast(error.response?.data?.message || 'Error downloading invoice', 'error');
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
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Invoices</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage all sales invoices</p>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by invoice number, customer, or driver..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={['ID', 'Invoice Number', 'Customer', 'Driver', 'Total Amount', 'Items Count', 'Date', 'Actions']}
          data={filteredSales}
          renderRow={(sale) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{sale.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{sale.invoice_number}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{sale.customer_name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {sale.driver?.name || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-green-600 dark:text-green-400">${parseFloat(sale.total_amount).toFixed(2)}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                  {sale.items?.length || 0} items
                </span>
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
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => handleViewInvoice(sale)}>
                View
              </Button>
              <Button variant="success" onClick={() => handleDownloadInvoice(sale.id)}>
                Download PDF
              </Button>
              <Button variant="secondary" onClick={() => navigate(`/sales/${sale.id}`)}>
                Details
              </Button>
            </div>
          )}
        />
      </div>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedSale(null);
        }}
        title={`Invoice ${selectedSale?.invoice_number || ''}`}
        size="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            {/* Invoice Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">INVOICE</h2>
                  <p className="text-gray-600 dark:text-gray-400">#{selectedSale.invoice_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(selectedSale.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Customer & Driver Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Customer</h3>
                <p className="text-gray-900 dark:text-white">{selectedSale.customer_name}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Driver</h3>
                <p className="text-gray-900 dark:text-white">{selectedSale.driver?.name || selectedSale.driver_name || 'N/A'}</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">Items</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Product</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Quantity</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Subtotal</th>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</p>
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
                Download PDF Invoice
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate(`/sales/${selectedSale.sale_id || selectedSale.id}`)}
                className="flex-1"
              >
                View Full Details
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invoices;

