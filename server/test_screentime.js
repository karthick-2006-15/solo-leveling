import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { screenTimeService } from './src/services/screenTimeService.ts';
import User from './src/models/User.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function runTest() {
  console.log('Connecting to DB...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected!');

  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    process.exit(1);
  }

  const userId = user._id.toString();
  console.log('Testing manual log for user:', userId);

  const payload = {
    totalTimeMinutes: 180,
    apps: [
      { name: 'Instagram', minutes: 60, categoryGuess: 'social_media' },
      { name: 'VS Code', minutes: 90, categoryGuess: 'coding' },
      { name: 'Chrome', minutes: 30, categoryGuess: 'neutral' }
    ]
  };

  try {
    const result = await screenTimeService.processScreenTime(userId, payload);
    console.log('Log Success! Boss State:', result.boss);
    console.log('Log Data:', result.log);
  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTest();
