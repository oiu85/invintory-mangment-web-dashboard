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

      await updateRoomDoor(roomId, data);
      showToast('Door configuration updated successfully', 'success');
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating door:', error);
      showToast(
        error.response?.data?.message || 'Failed to update door configuration',
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
        Door Configuration
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Door X Position (cm)"
            type="number"
            value={doorData.door_x}
            onChange={(e) => handleChange('door_x', e.target.value)}
            min="0"
            step="0.01"
          />

          <Input
            label="Door Y Position (cm)"
            type="number"
            value={doorData.door_y}
            onChange={(e) => handleChange('door_y', e.target.value)}
            min="0"
            step="0.01"
          />

          <Input
            label="Door Width (cm)"
            type="number"
            value={doorData.door_width}
            onChange={(e) => handleChange('door_width', e.target.value)}
            min="0.01"
            step="0.01"
          />

          <Input
            label="Door Height (cm)"
            type="number"
            value={doorData.door_height}
            onChange={(e) => handleChange('door_height', e.target.value)}
            min="0.01"
            step="0.01"
          />
        </div>

        <Select
          label="Door Wall"
          value={doorData.door_wall}
          onChange={(e) => handleChange('door_wall', e.target.value)}
          options={[
            { value: 'north', label: 'North' },
            { value: 'south', label: 'South' },
            { value: 'east', label: 'East' },
            { value: 'west', label: 'West' },
          ]}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Door Configuration'}
          </Button>
        </div>
      </form>

      {room && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>Room Dimensions:</strong> {parseFloat(room.width || 0).toFixed(0)} ×{' '}
            {parseFloat(room.depth || 0).toFixed(0)} × {parseFloat(room.height || 0).toFixed(0)} cm
          </p>
          <p className="mt-2">
            <strong>Note:</strong> Door position must be within room boundaries.
          </p>
        </div>
      )}
    </div>
  );
};

export default DoorConfig;
