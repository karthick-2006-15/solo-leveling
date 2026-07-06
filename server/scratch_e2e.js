const BASE_URL = 'http://localhost:5001/api';

const routesToTest = [
  { method: 'GET', path: '/users/profile' },
  { method: 'GET', path: '/progression/me' },
  
  { method: 'GET', path: '/habits' },
  { method: 'POST', path: '/habits', body: { name: 'Test', type: 'good' } },
  
  { method: 'GET', path: '/workouts/routines' },
  { method: 'POST', path: '/workouts/routines', body: { name: 'Push', exercises: [] } },
  { method: 'GET', path: '/workouts/prs' },
  { method: 'GET', path: '/workouts/history' },
  
  { method: 'GET', path: '/nutrition/log' },
  { method: 'POST', path: '/nutrition/manual', body: { name: 'Apple', calories: 100, protein: 0, carbs: 20, fat: 0 } },
  { method: 'GET', path: '/nutrition/water' },
  
  { method: 'GET', path: '/skills' },
  { method: 'POST', path: '/skills', body: { name: 'Programming', category: 'Intelligence' } },
  
  { method: 'GET', path: '/dsa/problems' },
  { method: 'POST', path: '/dsa/problems', body: { title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy' } },
  
  { method: 'GET', path: '/missions/quests' },
  { method: 'GET', path: '/missions/boss' },
  
  { method: 'GET', path: '/weight' },
  { method: 'POST', path: '/weight', body: { weight: 75 } },
  
  { method: 'GET', path: '/analytics/progression' },
  
  { method: 'GET', path: '/achievements' },
  
  { method: 'GET', path: '/notifications/settings' },
];

async function runTests() {
  console.log('Registering mock user to get valid token...');
  const email = `test_${Date.now()}@test.com`;
  
  const authRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  
  const authData = await authRes.json();
  if (!authData.token) {
    console.error('Failed to register user:', authData);
    process.exit(1);
  }
  
  const token = authData.token;
  console.log('Got valid token. Starting E2E API Sweep...\n');
  
  const HEADERS = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  let failures = 0;
  
  for (const route of routesToTest) {
    try {
      const url = `${BASE_URL}${route.path}`;
      const options = {
        method: route.method,
        headers: HEADERS,
      };
      if (route.body) options.body = JSON.stringify(route.body);

      const response = await fetch(url, options);
      const data = await response.json().catch(() => null);

      if (response.status >= 500) {
        console.error(`❌ [FAIL ${response.status}] ${route.method} ${route.path}`);
        console.error(data);
        failures++;
      } else {
        console.log(`✅ [PASS ${response.status}] ${route.method} ${route.path}`);
      }
    } catch (err) {
      console.error(`❌ [ERROR] ${route.method} ${route.path}:`, err.message);
      failures++;
    }
  }

  console.log(`\nScan Complete. Failures: ${failures}`);
  process.exit(failures > 0 ? 1 : 0);
}

runTests();
