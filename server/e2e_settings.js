import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';

const testUserId = new mongoose.Types.ObjectId().toString();
const token = jwt.sign({ id: testUserId }, JWT_SECRET, { expiresIn: '1h' });

async function verifySettingsFix() {
  console.log("Connecting to DB...");
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/solo_leveling');

  // Insert mock user directly bypassing validation
  await mongoose.connection.collection('users').insertOne({
    _id: new mongoose.Types.ObjectId(testUserId),
    name: 'Test Settings User',
    email: 'test_settings@example.com'
  });

  console.log("Testing PUT /api/users/profile with valid new fields...");
  
  const payload = {
    name: 'Updated Name',
    targetWeight: 75,
    targetBodyFat: 12,
    medicalNotes: 'Bad left knee',
    activityLevel: 'moderate',
    experienceLevel: 'expert',
    age: null,
    weight: null
  };

  const res = await fetch('http://localhost:5000/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("FAILED! Received error:", data);
    process.exit(1);
  }

  console.log("SUCCESS! User saved:", data.user);
  
  if (data.user.targetWeight === 75 && data.user.experienceLevel === 'expert') {
    console.log("Verified new fields persist successfully.");
  } else {
    console.error("New fields did not persist!");
    process.exit(1);
  }

  console.log("Testing invalid enum...");
  const invalidPayload = { activityLevel: 'extra_active' };
  const res2 = await fetch('http://localhost:5000/api/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(invalidPayload)
  });

  const data2 = await res2.json();
  if (res2.status === 400 && data2.message && data2.message.includes('extra_active')) {
    console.log("SUCCESS! Invalid enum properly returned 400 with detailed message:", data2.message);
  } else {
    console.error("FAILED! Did not return expected 400 validation error:", data2);
    process.exit(1);
  }

  // Cleanup
  await mongoose.connection.collection('users').deleteOne({ _id: new mongoose.Types.ObjectId(testUserId) });
  await mongoose.disconnect();
  console.log("All tests passed.");
}

verifySettingsFix().catch(err => {
  console.error("Test error:", err);
  process.exit(1);
});
