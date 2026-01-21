import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoom } from '../api/roomApi';
import LayoutGenerator from '../components/LayoutGenerator';
import Modal from '../components/Modal';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';

const RoomLayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [id]);

  const fetchRoom = async () => {
    try {
      const data = await getRoom(id);
      setRoom(data);
    } catch (error) {
      console.error('Error fetching room:', error);
      showToast(t('errorLoadingRooms'), 'error');
      navigate('/rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (result) => {
    // Navigate back to room details after successful generation
    setTimeout(() => {
      navigate(`/rooms/${id}`);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="mb-6">
        <Button variant="secondary" onClick={() => navigate(`/rooms/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('backToRooms')}
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('generateLayout')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {t('roomName')}: <strong>{room.name}</strong> | {t('roomDimensions')}: {parseFloat(room.width || 0).toFixed(0)} × {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} cm
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <LayoutGenerator
          roomId={id}
          onSuccess={handleSuccess}
          onClose={() => navigate(`/rooms/${id}`)}
        />
      </div>
    </div>
  );
};

export default RoomLayout;
