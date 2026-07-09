const axios = require('axios');
const mongoose = require('mongoose');
const { sign } = require('jsonwebtoken');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/solo-leveling');
  
  // Register user directly
  let user = await mongoose.connection.collection('users').findOne({});
  if (!user) {
    console.log('No user found, creating one...');
    try {
      const result = await axios.post('http://127.0.0.1:5000/api/auth/register', {
        name: 'Hunter', email: 'hunter2@test.com', password: 'password123'
      });
      console.log('Registered', result.data);
    } catch(e) {}
    user = await mongoose.connection.collection('users').findOne({});
  }

  const token = sign({ id: user._id }, 'supersecret_jwt_key', { expiresIn: '1d' });
  const headers = { Cookie: `token=${token}` };
  
  console.log('Token generated:', token);

  try {
    const res1 = await axios.get('http://127.0.0.1:5000/api/users/profile', { headers });
    console.log('/api/users/profile:', res1.status);
  } catch (e) {
    console.log('/api/users/profile ERROR:', e.response?.status, e.response?.data);
  }

  try {
    const res2 = await axios.get('http://127.0.0.1:5000/api/progression/history', { headers });
    console.log('/api/progression/history:', res2.status);
  } catch (e) {
    console.log('/api/progression/history ERROR:', e.response?.status, e.response?.data);
  }

  try {
    const res3 = await axios.get('http://127.0.0.1:5000/api/progression/prediction', { headers });
    console.log('/api/progression/prediction:', res3.status);
  } catch (e) {
    console.log('/api/progression/prediction ERROR:', e.response?.status, e.response?.data);
  }

  process.exit(0);
}
run();
