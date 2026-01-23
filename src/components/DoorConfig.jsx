import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getRoomDoor, updateRoomDoor } from '../api/roomApi';
import Button from './Button';
import Input from './Input';
import Select from './Select';

const DoorConfig = ({ roomId, room, onUpdate }) => {
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [doorData, setDoorData] = useState({
    door_x: '',
    door_y: '',
    door_width: '',
    door_height: '',
    door_wall: 'north',
  });

  useEffect(() => {
    if (room?.door) {
      setDoorData({
        door_x: room.door.x || '',
        door_y: room.door.y || '',
        door_width: room.door.width || '',
        door_height: room.door.height || '',
        door_wall: room.door.wall || 'north',
      });
    } else {
      fetchDoor();
    }
  }, [roomId, room]);

  const fetchDoor = async () => {
    try {
      const data = await getRoomDoor(roomId);
      if (data.door) {
        setDoorData({
          door_x: data.door.x || '',
          door_y: data.door.y || '',
          door_width: data.door.width || '',
          door_height: data.door.height || '',
          door_wall: data.door.wall || 'north',
        });
      }
    } catch (error) {
      console.error('Error fetching door:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        door_x: parseFloat(doorData.door_x) || null,
        door_y: parseFloat(doorData.door_y) || null,
        door_width: parseFloat(doorData.door_width) || null,
        door_height: parseFloat(doorData.door_height) || null,
        door_wall: doorData.door_wall || null,
      };

      const response = await updateRoomDoor(roomId, data);
      console.log('Door update response:', response);
      
      showToast(t('doorConfigurationUpdated'), 'success');
      
      // Update local door data immediately from response if available
      // Axios unwraps response.data, so we check response.door directly
      if (response?.door) {
        console.log('Updating door data from response:', response.door);
        setDoorData({
          door_x: response.door.x || '',
          door_y: response.door.y || '',
          door_width: response.door.width || '',
          door_height: response.door.height || '',
          door_wall: response.door.wall || 'north',
        });
      } else {
        // Fallback: refetch door data
        console.log('Refetching door data...');
        await fetchDoor();
      }
      
      // Call onUpdate to refresh room data in parent component
      // This will trigger a re-render of the 2D and 3D views
      if (onUpdate) {
        console.log('Calling onUpdate to refresh room data...');
        // Use a small delay to ensure state updates are processed
        setTimeout(() => {
          onUpdate();
        }, 200);
      }
    } catch (error) {
      console.error('Error updating door:', error);
      showToast(
        error.response?.data?.message || t('errorUpdatingDoor'),
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setDoorData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('doorConfiguration')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={t('doorXPosition')}
            type="number"
            value={doorData.door_x}
            onChange={(e) => handleChange('door_x', e.target.value)}
            min="0"
            step="0.01"
          />

          <Input
            label={t('doorYPosition')}
            type="number"
            value={doorData.door_y}
            onChange={(e) => handleChange('door_y', e.target.value)}
            min="0"
            step="0.01"
          />

          <Input
            label={t('doorWidth')}
            type="number"
            value={doorData.door_width}
            onChange={(e) => handleChange('door_width', e.target.value)}
            min="0.01"
            step="0.01"
          />

          <Input
            label={t('doorHeight')}
            type="number"
            value={doorData.door_height}
            onChange={(e) => handleChange('door_height', e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>

        <Select
          label={t('doorWall')}
          value={doorData.door_wall}
          onChange={(e) => handleChange('door_wall', e.target.value)}
          options={[
            { value: 'north', label: t('north') },
            { value: 'south', label: t('south') },
            { value: 'east', label: t('east') },
            { value: 'west', label: t('west') },
          ]}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? t('saving') : t('saveDoorConfiguration')}
          </Button>
        </div>
      </form>

      {room && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>{t('roomDimensions')}:</strong> {parseFloat(room.width || 0).toFixed(0)} ×{' '}
            {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} {t('cm')}
          </p>
          <p className="mt-2">
            <strong>{t('note')}:</strong> {t('doorPositionNote')}
          </p>
        </div>
      )}
    </div>
  );
};

export default DoorConfig;
