import axiosClient from './axiosClient';

export const getDrivers = () => {
  return axiosClient.get('/admin/drivers');
};

export const getDriver = (id) => {
  return axiosClient.get(`/admin/drivers/${id}`);
};

export const getDriverAnalytics = (id) => {
  return axiosClient.get(`/admin/drivers/${id}/analytics`);
};

export const createDriver = (data) => {
  return axiosClient.post('/admin/drivers', data);
};

export const updateDriver = (id, data) => {
  return axiosClient.put(`/admin/drivers/${id}`, data);
};

export const deleteDriver = (id) => {
  return axiosClient.delete(`/admin/drivers/${id}`);
};

export const getDriverStock = (id) => {
  return axiosClient.get(`/drivers/${id}/stock`);
};

export const getDriverStockHistory = (id) => {
  return axiosClient.get(`/admin/drivers/${id}/stock-history`);
};

export const getDriverInventory = (id, startDate, endDate) => {
  return axiosClient.get(`/admin/drivers/${id}/inventory`, {
    params: { start_date: startDate, end_date: endDate }
  });
};

export const getDriverSettlement = (id, startDate, endDate, periodType = 'week') => {
  return axiosClient.get(`/admin/drivers/${id}/settlement`, {
    params: { start_date: startDate, end_date: endDate, period_type: periodType },
    responseType: 'blob'
  });
};

export const performInventory = (id, periodData) => {
  return axiosClient.post(`/admin/drivers/${id}/perform-inventory`, periodData);
};

export const getInventoryHistory = (id, page = 1, perPage = 15) => {
  return axiosClient.get(`/admin/drivers/${id}/inventory-history`, {
    params: { page, per_page: perPage }
  });
};
