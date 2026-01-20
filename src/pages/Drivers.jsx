import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const Drivers = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverStock, setDriverStock] = useState([]);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingStock, setLoadingStock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = drivers.filter(driver =>
        driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDrivers(filtered);
    } else {
      setFilteredDrivers(drivers);
    }
  }, [searchTerm, drivers]);

  const fetchDrivers = async () => {
    try {
      const response = await axiosClient.get('/admin/drivers');
      setDrivers(response.data);
      setFilteredDrivers(response.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast(t('errorLoadingDrivers'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverStock = async (driverId) => {
    setLoadingStock(true);
    try {
      const driver = drivers.find(d => d.id === driverId);
      setSelectedDriver(driver);
      const response = await axiosClient.get(`/drivers/${driverId}/stock`);
      setDriverStock(response.data);
      setIsStockModalOpen(true);
    } catch (error) {
      console.error('Error fetching driver stock:', error);
      showToast(t('errorFetchingStock'), 'error');
    } finally {
      setLoadingStock(false);
    }
  };

  const handleAddDriver = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
    });
    setIsAddModalOpen(true);
  };

  const handleEdit = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      password: '',
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (driver) => {
    setDriverToDelete(driver);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitDriver = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }

    try {
      if (selectedDriver) {
        // Update
        await axiosClient.put(`/admin/drivers/${selectedDriver.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('driverUpdated'), 'success');
        setIsEditModalOpen(false);
      } else {
        // Create
        formDataToSend.append('password', formData.password);
        await axiosClient.post('/admin/drivers', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('driverCreated'), 'success');
        setIsAddModalOpen(false);
      }
      setFormData({ name: '', email: '', password: '' });
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      showToast(error.response?.data?.message || t('errorSavingDriver'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;

    try {
      await axiosClient.delete(`/admin/drivers/${driverToDelete.id}`);
      showToast(t('driverDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      showToast(t('errorDeletingDriver'), 'error');
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleDrivers')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionDrivers')}</p>
        </div>
        <Button onClick={handleAddDriver}>{t('addDriver')}</Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchDrivers')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={[t('id'), t('name'), t('email'), t('totalSales'), t('totalRevenue'), t('stockItems'), t('joined')]}
          data={filteredDrivers}
          renderRow={(driver) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{driver.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{driver.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{driver.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {driver.total_sales || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${parseFloat(driver.total_revenue || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                  {driver.total_stock_items || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(driver.created_at).toLocaleDateString()}
              </td>
            </>
          )}
          actions={(driver) => (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => fetchDriverStock(driver.id)}>
                {t('stock')}
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(driver)}>
                {t('edit')}
              </Button>
              <Button variant="danger" onClick={() => handleDeleteClick(driver)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </div>

      {/* Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={t('stockForDriver').replace('{name}', selectedDriver?.name || t('drivers'))}
        size="lg"
      >
        {loadingStock ? (
          <LoadingSpinner />
        ) : driverStock.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t('noStockAssigned')}</p>
          </div>
        ) : (
          <Table
            headers={[t('product'), t('category'), t('quantity')]}
            data={driverStock}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {item.product?.name || t('nA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {item.product?.category?.name || t('nA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-sm font-semibold">
                    {item.quantity} {t('units')}
                  </span>
                </td>
              </>
            )}
          />
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedDriver(null);
          setFormData({ name: '', email: '', password: '' });
        }}
        title={selectedDriver ? t('editDriver') : t('createDriver')}
      >
        <form onSubmit={handleSubmitDriver}>
          <Input
            label={t('driverName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label={t('driverEmail')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={selectedDriver ? t('newPassword') : t('driverPassword')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!selectedDriver}
            minLength={6}
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : selectedDriver ? t('update') : t('createDriver')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setIsEditModalOpen(false);
                setSelectedDriver(null);
                setFormData({ name: '', email: '', password: '' });
              }}
            >
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDriverToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteDriver')}
        message={t('deleteDriverMessage').replace('{name}', driverToDelete?.name || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default Drivers;
