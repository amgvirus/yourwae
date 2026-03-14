import supabase from '../supabase';

export const storeAPI = {
  getAllStores: async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
  },
  getStoresByFilter: async (filters) => {
    try {
      let query = supabase.from('stores').select('*').eq('is_active', true);
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.search) {
        query = query.ilike('store_name', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching filtered stores:', error);
      return [];
    }
  },
  getStoreById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching store:', error);
      return null;
    }
  },
  getProductsByStore: async (storeId) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }
};

export const townAPI = {
  getAllTowns: async () => {
    try {
      // Since 'towns' table might not be fully established in Supabase schema seen in SCHEMA.md,
      // and Town.js had Hohoe, Dzodze, Anloga, we use those as hardcoded if table fetch fails.
      const { data, error } = await supabase
        .from('towns')
        .select('*');
      
      if (error || !data || data.length === 0) {
        return [
          { name: 'Hohoe', delivery_fee: 7.00 },
          { name: 'Ho', delivery_fee: 10.00 },
          { name: 'Kpando', delivery_fee: 8.00 },
        ];
      }
      return data;
    } catch (error) {
      console.error('Error fetching towns:', error);
      return [
        { name: 'Hohoe', delivery_fee: 7.00 },
        { name: 'Ho', delivery_fee: 10.00 },
        { name: 'Kpando', delivery_fee: 8.00 },
      ];
    }
  }
};

export default supabase;
