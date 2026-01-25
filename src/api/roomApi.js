import axiosClient from './axiosClient';

// Room Management
export const getRooms = async () => {
  const response = await axiosClient.get('/rooms');
  return response.data;
};

export const getRoom = async (id) => {
  const response = await axiosClient.get(`/rooms/${id}`);
  return response.data;
};

export const createRoom = async (data) => {
  const response = await axiosClient.post('/rooms', data);
  return response.data;
};

export const updateRoom = async (id, data) => {
  const response = await axiosClient.put(`/rooms/${id}`, data);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await axiosClient.delete(`/rooms/${id}`);
  return response.data;
};

export const getRoomStats = async (id) => {
  const response = await axiosClient.get(`/rooms/${id}/stats`);
  return response.data;
};

// Room stock (per-room inventory)
export const getRoomStock = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/stock`);
  return response.data;
};

export const getProductRoomAvailability = async (productId) => {
  const response = await axiosClient.get(`/products/${productId}/room-availability`);
  return response.data;
};

// Layout Management
export const generateLayout = async (roomId, data) => {
  const response = await axiosClient.post(`/rooms/${roomId}/generate-layout`, data);
  return response.data;
};

export const getLayout = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/layout`);
  return response.data;
};

export const updateLayout = async (roomId, data) => {
  const response = await axiosClient.put(`/rooms/${roomId}/layout`, data);
  return response.data;
};

export const optimizeLayout = async (roomId) => {
  const response = await axiosClient.post(`/rooms/${roomId}/layout/optimize`);
  return response.data;
};

export const deleteLayout = async (roomId) => {
  const response = await axiosClient.delete(`/rooms/${roomId}/layout`);
  return response.data;
};

// Placements
export const getPlacements = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/placements`);
  return response.data;
};

export const addPlacement = async (roomId, data) => {
  const response = await axiosClient.post(`/rooms/${roomId}/placements`, data);
  return response.data;
};

export const updatePlacement = async (placementId, data) => {
  const response = await axiosClient.put(`/placements/${placementId}`, data);
  return response.data;
};

export const deletePlacement = async (placementId) => {
  const response = await axiosClient.delete(`/placements/${placementId}`);
  return response.data;
};

// Visualization
export const getVisualization = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/visualization`);
  return response.data;
};

export const getGridVisualization = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/visualization/grid`);
  return response.data;
};

export const get3DVisualization = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/visualization/3d`);
  return response.data;
};

// Storage Suggestions
export const suggestStorage = async (productId, quantity = 1) => {
  const response = await axiosClient.get(`/warehouse-stock/${productId}/suggest-storage`, {
    params: { quantity }
  });
  return response.data;
};

export const applySuggestion = async (data) => {
  const response = await axiosClient.post('/warehouse-stock/apply-suggestion', data);
  return response.data;
};

export const getPendingSuggestions = async () => {
  const response = await axiosClient.get('/warehouse-stock/pending-suggestions');
  return response.data;
};

// Product Dimensions
export const getProductDimensions = async (productId) => {
  const response = await axiosClient.get(`/products/${productId}/dimensions`);
  return response.data;
};

export const getAllProductDimensions = async () => {
  const response = await axiosClient.get('/products/dimensions');
  return response.data;
};

export const createProductDimensions = async (productId, data) => {
  const response = await axiosClient.post(`/products/${productId}/dimensions`, data);
  return response.data;
};

export const updateProductDimensions = async (productId, data) => {
  const response = await axiosClient.put(`/products/${productId}/dimensions`, data);
  return response.data;
};

export const deleteProductDimensions = async (productId) => {
  const response = await axiosClient.delete(`/products/${productId}/dimensions`);
  return response.data;
};

// Door Management
export const getRoomDoor = async (roomId) => {
  const response = await axiosClient.get(`/rooms/${roomId}/door`);
  return response.data;
};

export const updateRoomDoor = async (roomId, doorData) => {
  const response = await axiosClient.put(`/rooms/${roomId}/door`, doorData);
  return response.data;
};

// Layout Refresh
export const refreshRoomLayout = async (roomId) => {
  const response = await axiosClient.post(`/rooms/${roomId}/layout/refresh`);
  return response.data;
};

// Layout Validation
export const validateLayout = async (roomId, items) => {
  const response = await axiosClient.post(`/rooms/${roomId}/validate-layout`, { items });
  return response.data;
};

// Capacity Calculation
export const calculateRoomCapacity = async (roomId, items) => {
  const response = await axiosClient.post(`/rooms/${roomId}/validate-layout`, { items });
  return {
    capacity: response.data.capacity,
    suggestions: response.data.suggestions,
    room_validation: response.data.room_validation,
  };
};