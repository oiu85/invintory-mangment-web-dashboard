import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/roomApi';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/Textarea';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { Building2, Package, TrendingUp, AlertCircle, Search, Plus } from 'lucide-react';

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

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorConfigs = {
      blue: { iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400' },
      green: { iconBg: 'bg-gradient-to-br from-success-500 to-success-600', text: 'text-success-600 dark:text-success-400' },
      purple: { iconBg: 'bg-gradient-to-br from-secondary-500 to-secondary-600', text: 'text-secondary-600 dark:text-secondary-400' },
    };
    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <Card variant="glass" hover>
        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <div className={`${config.iconBg} p-3 rounded-xl shadow-lg`}>
              {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${config.text} mb-1`}>{value}</p>
            {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleRooms')}
        subtitle={t('pageDescriptionRooms')}
        actions={
          <Button onClick={handleCreate} icon={Plus} iconPosition="left">
            {t('addRoom')}
          </Button>
        }
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} variant="elevated">
                <Card.Body>
                  <Skeleton variant="avatar" className="mb-4" />
                  <Skeleton variant="title" className="mb-2" />
                  <Skeleton variant="text" />
                </Card.Body>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title={t('totalRooms')}
              value={totalRooms}
              icon={Building2}
              color="blue"
              subtitle={t('allRooms')}
            />
            <StatCard
              title={t('activeRooms')}
              value={activeRooms}
              icon={Package}
              color="green"
              subtitle={t('currentlyActive')}
            />
            <StatCard
              title={t('totalCapacity')}
              value={`${(totalCapacity / 1000000).toFixed(2)} m³`}
              icon={TrendingUp}
              color="purple"
              subtitle={t('totalVolume')}
            />
          </>
        )}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchRooms')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        <Table
          headers={[
            { key: 'id', label: t('id'), sortable: true },
            { key: 'roomName', label: t('roomName'), sortable: true },
            { key: 'roomDimensions', label: t('roomDimensions') },
            { key: 'roomWarehouse', label: t('roomWarehouse') },
            { key: 'roomStatus', label: t('roomStatus'), sortable: true },
            { key: 'roomUtilization', label: t('roomUtilization'), sortable: true },
          ]}
          data={filteredRooms}
          sortable={true}
          loading={loading}
          emptyMessage={t('noData')}
          renderRow={(room) => {
            const dimensions = `${parseFloat(room.width || 0).toFixed(0)}×${parseFloat(room.depth || 0).toFixed(0)}×${parseFloat(room.height || 0).toFixed(0)} ${t('cm')}`;
            const statusVariants = {
              active: 'success',
              inactive: 'default',
              maintenance: 'warning',
            };
            const latestLayout = room.layouts && room.layouts.length > 0 
              ? room.layouts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
              : null;
            const utilization = latestLayout ? latestLayout.utilization_percentage : 0;

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{room.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{room.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  <Badge variant="primary">{dimensions}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {room.warehouse ? (
                    <Badge>{room.warehouse.name}</Badge>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={statusVariants[room.status] || 'default'} size="sm">
                    {t(room.status) || room.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {latestLayout ? (
                    <Badge 
                      variant={utilization >= 80 ? 'error' : utilization >= 50 ? 'warning' : 'success'}
                      size="sm"
                    >
                      {utilization.toFixed(1)}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" size="sm">
                      {t('noLayout')}
                    </Badge>
                  )}
                </td>
              </>
            );
          }}
          actions={(room) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/rooms/${room.id}`)}>
                {t('viewRoomDetails')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleEdit(room)}>
                {t('edit')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(room)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </Card>

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
