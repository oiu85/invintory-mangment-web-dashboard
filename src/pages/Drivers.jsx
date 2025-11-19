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

const Drivers = () => {
  const { showToast } = useToast();
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
      showToast('Error loading drivers', 'error');
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
      showToast('Error fetching driver stock', 'error');
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
        showToast('Driver updated successfully!', 'success');
        setIsEditModalOpen(false);
      } else {
        // Create
        formDataToSend.append('password', formData.password);
        await axiosClient.post('/admin/drivers', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast('Driver created successfully!', 'success');
        setIsAddModalOpen(false);
      }
      setFormData({ name: '', email: '', password: '' });
      setSelectedDriver(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error saving driver:', error);
      showToast(error.response?.data?.message || 'Error saving driver', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!driverToDelete) return;

    try {
      await axiosClient.delete(`/admin/drivers/${driverToDelete.id}`);
      showToast('Driver deleted successfully!', 'success');
      setIsDeleteModalOpen(false);
      setDriverToDelete(null);
      fetchDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      showToast('Error deleting driver', 'error');
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Drivers</h1>
          <p className="text-gray-600">Manage your delivery drivers and their performance</p>
        </div>
        <Button onClick={handleAddDriver}>+ Add Driver</Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search drivers by name or email..."
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={['ID', 'Name', 'Email', 'Total Sales', 'Total Revenue', 'Stock Items', 'Joined']}
          data={filteredDrivers}
          renderRow={(driver) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{driver.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">{driver.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver.email}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {driver.total_sales || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="font-semibold text-green-600">
                  ${parseFloat(driver.total_revenue || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {driver.total_stock_items || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(driver.created_at).toLocaleDateString()}
              </td>
            </>
          )}
          actions={(driver) => (
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => fetchDriverStock(driver.id)}>
                Stock
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(driver)}>
                Edit
              </Button>
              <Button variant="danger" onClick={() => handleDeleteClick(driver)}>
                Delete
              </Button>
            </div>
          )}
        />
      </div>

      {/* Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Stock for ${selectedDriver?.name || 'Driver'}`}
        size="lg"
      >
        {loadingStock ? (
          <LoadingSpinner />
        ) : driverStock.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No stock assigned to this driver yet.</p>
          </div>
        ) : (
          <Table
            headers={['Product', 'Category', 'Quantity']}
            data={driverStock}
            renderRow={(item) => (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {item.product?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.product?.category?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {item.quantity} units
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
        title={selectedDriver ? 'Edit Driver' : 'Add New Driver'}
      >
        <form onSubmit={handleSubmitDriver}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label={selectedDriver ? "New Password (leave empty to keep current)" : "Password"}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!selectedDriver}
            minLength={6}
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : selectedDriver ? 'Update' : 'Create Driver'}
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
              Cancel
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
        title="Delete Driver"
        message={`Are you sure you want to delete "${driverToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Drivers;
