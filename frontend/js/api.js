// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://your-production-backend.vercel.app/api'; 


// Town API
const townAPI = {
  async getAllTowns() {
    try {
      const response = await fetch(`${API_BASE_URL}/towns`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching towns:', error);
      return [];
    }
  },

  async getTownById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/towns/${id}`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching town:', error);
      return null;
    }
  },
};

// Store API
const storeAPI = {
  async getAllStores() {
    try {
      const response = await fetch(`${API_BASE_URL}/stores`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },

  async getStoresByTown(townId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/town/${townId}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching stores by town:', error);
      return [];
    }
  },

  async getStoreById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/stores/${id}`);
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },

  async getStoresByFilter(filters) {
    try {
      const queryParams = new URLSearchParams();
      if (filters.town) queryParams.append('town', filters.town);
      if (filters.category) queryParams.append('category', filters.category);

      const response = await fetch(`${API_BASE_URL}/stores?${queryParams.toString()}`);
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching filtered stores:', error);
      return [];
    }
  },
};

// Local Storage for selected town
const townManager = {
  setSelectedTown(townId, townName) {
    localStorage.setItem('selectedTown', JSON.stringify({ id: townId, name: townName }));
  },

  getSelectedTown() {
    const town = localStorage.getItem('selectedTown');
    return town ? JSON.parse(town) : null;
  },

  clearSelectedTown() {
    localStorage.removeItem('selectedTown');
  },
};
