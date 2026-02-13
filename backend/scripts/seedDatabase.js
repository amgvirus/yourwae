const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Town = require('./src/models/Town');
const connectDB = require('./src/config/database');

dotenv.config();

const seedTowns = async () => {
  try {
    await connectDB();
    
    // Clear existing towns
    await Town.deleteMany({});
    
    // Create towns
    const towns = [
      {
        name: 'Hohoe',
        description: 'Commercial hub in Guan region',
        latitude: 6.7936,
        longitude: -0.4778,
        deliveryFee: 5,
        isActive: true,
      },
      {
        name: 'Dzodze',
        description: 'Town in Volta region',
        latitude: 6.3833,
        longitude: 0.6833,
        deliveryFee: 5,
        isActive: true,
      },
      {
        name: 'Anloga',
        description: 'Coastal town in Greater Accra region',
        latitude: 5.7831,
        longitude: -0.1939,
        deliveryFee: 5,
        isActive: true,
      },
    ];

    const createdTowns = await Town.insertMany(towns);
    
    console.log('✅ Seed completed successfully!');
    console.log('Created towns:', createdTowns.map(t => ({ id: t._id, name: t.name })));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedTowns();
