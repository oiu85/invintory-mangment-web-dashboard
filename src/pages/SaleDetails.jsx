import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

const SaleDetails = () => {
  const { showToast } = useToast();
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
      showToast('Error loading sale details', 'error');
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
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sale Not Found</h2>
          <p className="text-gray-600 mb-4">The sale you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/sales')}>Back to Sales</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate('/sales')}>
          ← Back to Sales
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-bold text-gray-800">Sale Details</h1>
          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
            Invoice #{sale.invoice_number}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
            <p className="text-lg font-semibold font-mono">{sale.invoice_number}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Customer Name</p>
            <p className="text-lg font-semibold">{sale.customer_name}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Driver</p>
            <p className="text-lg font-semibold">{sale.driver?.name || sale.driver_name || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-green-600">${parseFloat(sale.total_amount).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">Date & Time</p>
            <p className="text-lg font-semibold">
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

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Items</h2>
        <div className="overflow-x-auto">
          <Table
            headers={['Product Name', 'Quantity', 'Unit Price', 'Subtotal']}
            data={sale.items || []}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{item.product_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                    {item.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(item.price).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold text-green-600">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </td>
              </>
            )}
          />
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-2">Total Amount</p>
            <p className="text-3xl font-bold text-green-600">${parseFloat(sale.total_amount).toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;
