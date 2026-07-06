import mongoose from 'mongoose';
import { buildUserContext } from './src/services/aiContextService';
import User from './src/models/User';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

async function verifyContext() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) throw new Error('No DB URI');
  await mongoose.connect(MONGODB_URI);
  
  const user = await User.findOne({ email: 'tester_aria@test.com' });
  if (!user) {
    console.log('No user');
    process.exit(1);
  }
  
  const ctx = await buildUserContext(user._id.toString());
  console.log('--- CONTEXT ---');
  console.log(ctx);
  console.log('--- END CONTEXT ---');
  
  process.exit(0);
}

verifyContext().catch(console.error);
