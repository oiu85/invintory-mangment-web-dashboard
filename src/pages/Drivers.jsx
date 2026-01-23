import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Search, Users, Plus, Package } from 'lucide-react';

const Drivers = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleDrivers')}
        subtitle={t('pageDescriptionDrivers')}
        actions={
          <Button onClick={handleAddDriver} icon={Plus} iconPosition="left">
            {t('addDriver')}
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
            placeholder={t('searchDrivers')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        <Table
          headers={[
            { key: 'id', label: t('id'), sortable: true },
            { key: 'name', label: t('name'), sortable: true },
            { key: 'email', label: t('email'), sortable: true },
            { key: 'totalSales', label: t('totalSales'), sortable: true },
            { key: 'totalRevenue', label: t('totalRevenue'), sortable: true },
            { key: 'stockItems', label: t('stockItems'), sortable: true },
            { key: 'joined', label: t('joined'), sortable: true },
          ]}
          data={filteredDrivers}
          sortable={true}
          loading={loading}
          emptyMessage={t('noData')}
          renderRow={(driver) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{driver.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{driver.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">{driver.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge variant="primary">{driver.total_sales || 0}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold text-success-600 dark:text-success-400">
                  ${parseFloat(driver.total_revenue || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge variant="secondary">{driver.total_stock_items || 0}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {new Date(driver.created_at).toLocaleDateString()}
              </td>
            </>
          )}
          actions={(driver) => (
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={() => navigate(`/drivers/${driver.id}`)}>
                {t('viewDetails')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fetchDriverStock(driver.id)}>
                {t('stock')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(driver)}>
                {t('edit')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(driver)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </Card>

      {/* Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={t('stockForDriver').replace('{name}', selectedDriver?.name || t('drivers'))}
        size="lg"
      >
        {loadingStock ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="avatar" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="heading" />
                  <Skeleton variant="text" />
                </div>
              </div>
            ))}
          </div>
        ) : driverStock.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-neutral-100 dark:bg-neutral-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-neutral-400 dark:text-neutral-500" />
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">{t('noStockAssigned')}</p>
          </div>
        ) : (
          <Table
            headers={[t('product'), t('category'), t('quantity')]}
            data={driverStock}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">
                  {item.product?.name || t('nA')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  <Badge>{item.product?.category?.name || t('nA')}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  <Badge variant="success">
                    {item.quantity} {t('units')}
                  </Badge>
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
        <form onSubmit={handleSubmitDriver} className="space-y-4">
          <Input
            id="driver-name"
            label={t('driverName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            id="driver-email"
            label={t('driverEmail')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            id="driver-password"
            label={selectedDriver ? t('newPassword') : t('driverPassword')}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!selectedDriver}
            minLength={6}
          />
          <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="submit" loading={submitting} className="flex-1">
              {selectedDriver ? t('update') : t('createDriver')}
            </Button>
            <Button
              type="button"
              variant="ghost"
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
