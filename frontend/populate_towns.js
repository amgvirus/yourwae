import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzphgpikqxfeiautsnbm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6cGhncGlrcXhmZWlhdXRzbmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5Mzk0NjMsImV4cCI6MjA4NjUxNTQ2M30.1S9aunKzGj8WvsETTtsCQhZHzNMrKfb5cBQYKsaN3cc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const populateTowns = async () => {
  const towns = [
    { name: 'Hohoe', delivery_fee: 7.00 },
    { name: 'Ho', delivery_fee: 10.00 },
    { name: 'Kpando', delivery_fee: 8.00 }
  ];

  console.log('Inserting operational towns...');
  for (const town of towns) {
    const { data, error } = await supabase
      .from('towns')
      .upsert({ name: town.name, delivery_fee: town.delivery_fee }, { onConflict: 'name' });
      
    if (error) {
      console.error(`Error inserting ${town.name}:`, error.message);
    } else {
      console.log(`Successfully activated ${town.name}`);
    }
  }
};

populateTowns();
