import axios from 'axios';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : (window.location.origin + '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const storeAPI = {
  getAllStores: async () => {
    try {
      const response = await api.get('/stores');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },
  getStoresByFilter: async (filters) => {
    try {
      const response = await api.get('/stores', { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching filtered stores:', error);
      return [];
    }
  },
  getStoreById: async (id) => {
    try {
      const response = await api.get(`/stores/${id}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },
  getProductsByStore: async (storeId) => {
    try {
      const response = await api.get(`/products/store/${storeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
};

export const townAPI = {
  getAllTowns: async () => {
    try {
      const response = await api.get('/towns');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching towns:', error);
      return [];
    }
  }
};

export default api;
