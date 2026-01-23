import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoom } from '../api/roomApi';
import LayoutGenerator from '../components/LayoutGenerator';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import PageHeader from '../components/layout/PageHeader';
import EmptyState from '../components/ui/ErrorState';
import { ArrowLeft, AlertCircle } from 'lucide-react';

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
      <div className="min-h-screen">
        <PageHeader
          title={<Skeleton variant="heading" className="w-48" />}
          subtitle={<Skeleton variant="text" className="w-64" />}
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

  if (!room) {
    return (
      <div className="min-h-screen">
        <PageHeader
          title={t('roomNotFound')}
          subtitle={t('roomNotFoundMessage')}
        />
        <EmptyState
          icon={AlertCircle}
          title={t('roomNotFound')}
          description={t('roomNotFoundMessage')}
          action={() => navigate('/rooms')}
          actionLabel={t('backToRooms')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('generateLayout')}
        subtitle={`${t('roomName')}: ${room.name} | ${t('roomDimensions')}: ${parseFloat(room.width || 0).toFixed(0)} × ${parseFloat(room.depth || 0).toFixed(0)} × ${parseFloat(room.height || 0).toFixed(0)} ${t('cm')}`}
        showBack
        backPath={`/rooms/${id}`}
      />

      <Card variant="glass">
        <Card.Body>
          <LayoutGenerator
            roomId={id}
            onSuccess={handleSuccess}
            onClose={() => navigate(`/rooms/${id}`)}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default RoomLayout;
