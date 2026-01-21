import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/roomApi';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { Building2, Package, TrendingUp, AlertCircle } from 'lucide-react';

const Rooms = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    width: '',
    depth: '',
    height: '',
    warehouse_id: '',
    status: 'active',
    max_weight: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = rooms.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.warehouse?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRooms(filtered);
    } else {
      setFilteredRooms(rooms);
    }
  }, [searchTerm, rooms]);

  const fetchRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
      setFilteredRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      showToast(t('errorLoadingRooms'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      description: '',
      width: '',
      depth: '',
      height: '',
      warehouse_id: '',
      status: 'active',
      max_weight: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name || '',
      description: room.description || '',
      width: room.width || '',
      depth: room.depth || '',
      height: room.height || '',
      warehouse_id: room.warehouse_id || '',
      status: room.status || 'active',
      max_weight: room.max_weight || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = {
        ...formData,
        width: parseFloat(formData.width),
        depth: parseFloat(formData.depth),
        height: parseFloat(formData.height),
        warehouse_id: formData.warehouse_id || null,
        max_weight: formData.max_weight ? parseFloat(formData.max_weight) : null,
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, dataToSend);
        showToast(t('roomUpdated'), 'success');
      } else {
        await createRoom(dataToSend);
        showToast(t('roomCreated'), 'success');
      }
      setIsModalOpen(false);
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      showToast(error.response?.data?.message || t('errorSavingRoom'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (room) => {
    setRoomToDelete(room);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!roomToDelete) return;

    try {
      await deleteRoom(roomToDelete.id);
      showToast(t('roomDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setRoomToDelete(null);
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      showToast(t('errorDeletingRoom'), 'error');
    }
  };

  // Calculate statistics
  const totalRooms = filteredRooms.length;
  const activeRooms = filteredRooms.filter(r => r.status === 'active').length;
  const totalCapacity = filteredRooms.reduce((sum, room) => {
    const volume = (parseFloat(room.width) || 0) * (parseFloat(room.depth) || 0) * (parseFloat(room.height) || 0);
    return sum + volume;
  }, 0);

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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleRooms')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionRooms')}</p>
        </div>
        <Button onClick={handleCreate}>{t('addRoom')}</Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title={t('totalRooms')}
          value={totalRooms}
          icon={Building2}
          color="blue"
          subtitle={t('allRooms')}
        />
        <Card
          title={t('activeRooms')}
          value={activeRooms}
          icon={Package}
          color="green"
          subtitle={t('currentlyActive')}
        />
        <Card
          title={t('totalCapacity')}
          value={`${(totalCapacity / 1000000).toFixed(2)} m³`}
          icon={TrendingUp}
          color="purple"
          subtitle={t('totalVolume')}
        />
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchRooms')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table
          headers={[t('id'), t('roomName'), t('roomDimensions'), t('roomWarehouse'), t('roomStatus'), t('roomUtilization'), t('actions')]}
          data={filteredRooms}
          renderRow={(room) => {
            const dimensions = `${parseFloat(room.width || 0).toFixed(0)}×${parseFloat(room.depth || 0).toFixed(0)}×${parseFloat(room.height || 0).toFixed(0)} cm`;
            const statusConfig = {
              active: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', label: t('active') },
              inactive: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', label: t('inactive') },
              maintenance: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300', label: t('maintenance') },
            };
            const statusStyle = statusConfig[room.status] || statusConfig.active;
            const latestLayout = room.layouts && room.layouts.length > 0 
              ? room.layouts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
              : null;
            const utilization = latestLayout ? latestLayout.utilization_percentage : 0;

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{room.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{room.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                    {dimensions}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {room.warehouse ? (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                      {room.warehouse.name}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {latestLayout ? (
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        utilization >= 80 ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' :
                        utilization >= 50 ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                      }`}>
                        {utilization.toFixed(1)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('noLayout')}</span>
                  )}
                </td>
              </>
            );
          }}
          actions={(room) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => navigate(`/rooms/${room.id}`)}>
                {t('viewRoomDetails')}
              </Button>
              <Button variant="secondary" onClick={() => handleEdit(room)}>
                {t('edit')}
              </Button>
              <Button variant="danger" onClick={() => handleDeleteClick(room)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? t('editRoom') : t('createRoom')}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label={t('roomName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label={t('roomDescription')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('roomWidth')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              required
            />
            <Input
              label={t('roomDepth')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.depth}
              onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
              required
            />
            <Input
              label={t('roomHeight')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              required
            />
          </div>
          <Select
            label={t('roomStatus')}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={[
              { value: 'active', label: t('active') },
              { value: 'inactive', label: t('inactive') },
              { value: 'maintenance', label: t('maintenance') },
            ]}
          />
          <Input
            label={t('roomMaxWeight')}
            type="number"
            step="0.01"
            min="0"
            value={formData.max_weight}
            onChange={(e) => setFormData({ ...formData, max_weight: e.target.value })}
            placeholder={t('optional')}
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : editingRoom ? t('update') : t('create')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRoomToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteRoom')}
        message={t('deleteRoomMessage').replace('{name}', roomToDelete?.name || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default Rooms;
