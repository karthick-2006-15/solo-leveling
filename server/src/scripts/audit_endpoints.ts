import _mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const API_URL = 'http://127.0.0.1:5000/api';

async function runFullAudit() {
  console.log('--- E2E AUDIT START ---');

  // 1. Register a test user
  const email = `test_${Date.now()}@example.com`;
  console.log(`Registering user: ${email}`);
  
  const regRes = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Audit Hunter', email, password: 'password123' })
  });
  
  if (!regRes.ok) {
    const text = await regRes.text();
    console.log(`Failed to register: ${text}`);
    return;
  }
  
  const regData = await regRes.json();
  const token = regData.token;
  const headers = { 'Authorization': `Bearer ${token}` };
  
  console.log('✅ Registration Successful. Token acquired.');

  const endpoints = [
    { method: 'GET', url: '/progression/me' },
    { method: 'GET', url: '/missions/daily' },
    { method: 'GET', url: '/inventory' },
    { method: 'GET', url: '/dungeons' },
    { method: 'GET', url: '/rewards/shop' },
    { method: 'GET', url: '/economy/stats' },
    { method: 'GET', url: '/health/analytics' },
    { method: 'GET', url: '/monarch' },
    { method: 'GET', url: '/achievements' },
    { method: 'GET', url: '/analytics/xp_growth?granularity=day' },
    { method: 'GET', url: '/dsa/stats' },
    { method: 'GET', url: '/career/me' },
    { method: 'GET', url: '/academics/me' },
    { method: 'GET', url: '/finance/me' },
    { method: 'GET', url: '/aria/predictions' },
    { method: 'GET', url: '/aria/plans' },
    { method: 'GET', url: '/aria/decision' },
    { method: 'GET', url: '/aria/knowledge' }
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of endpoints) {
    try {
      const response = await fetch(`${API_URL}${ep.url}`, {
        method: ep.method,
        headers
      });
      
      const responseData = await response.text();

      if (response.ok) {
        console.log(`✅ [200 OK] ${ep.url}`);
        passed++;
      } else if (response.status >= 500) {
        console.log(`❌ [${response.status} SERVER ERROR] ${ep.url} - ${responseData}`);
        failed++;
      } else {
        console.log(`⚠️ [${response.status}] ${ep.url} - ${responseData}`);
        passed++;
      }
    } catch (err: any) {
      console.log(`❌ [NETWORK ERROR] ${ep.url} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nAudit Complete: ${passed} Passed, ${failed} Failed`);
}

runFullAudit();
