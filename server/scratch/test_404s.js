const axios = require('axios');
const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/solo-leveling-qa');
  const user = await mongoose.connection.collection('users').findOne({});
  const { sign } = require('jsonwebtoken');
  const token = sign({ id: user._id }, 'qa-secret', { expiresIn: '1d' });

  const headers = { Cookie: `jwt=${token}` };
  
  try {
    const res1 = await axios.get('http://127.0.0.1:5000/api/users/profile', { headers });
    console.log('/api/users/profile:', res1.status);
  } catch (e) {
    console.log('/api/users/profile:', e.response?.status, e.response?.data);
  }

  try {
    const res2 = await axios.get('http://127.0.0.1:5000/api/progression/history', { headers });
    console.log('/api/progression/history:', res2.status);
  } catch (e) {
    console.log('/api/progression/history:', e.response?.status, e.response?.data);
  }

  try {
    const res3 = await axios.get('http://127.0.0.1:5000/api/progression/prediction', { headers });
    console.log('/api/progression/prediction:', res3.status);
  } catch (e) {
    console.log('/api/progression/prediction:', e.response?.status, e.response?.data);
  }

  process.exit(0);
}
run();
