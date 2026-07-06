import mongoose from 'mongoose';
import Habit from '../src/models/Habit';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Adjust if needed

const run = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myhabit';
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB. Deactivating "Drink Water" habits...');
    const result = await Habit.updateMany(
      { name: 'Drink Water' },
      { $set: { active: false } }
    );
    
    console.log(`Successfully deactivated ${result.modifiedCount} habits.`);
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.disconnect();
  }
};

run();
