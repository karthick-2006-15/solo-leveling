import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const run = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    console.log("URI:", uri);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");
    
    // clear collection
    const result = await mongoose.connection.collection('foodcaches').deleteMany({});
    console.log(`Deleted ${result.deletedCount} items.`);
    
    process.exit(0);
  } catch (e) {
    console.error("Error:", e);
    process.exit(1);
  }
};
run();
