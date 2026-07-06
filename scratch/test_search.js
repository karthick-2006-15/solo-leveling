const BASE_URL = 'http://localhost:5001/api';

async function testSearch() {
  console.log('Registering mock user to get valid token...');
  const email = `test_${Date.now()}@test.com`;
  
  const authRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email, password: 'password123' })
  });
  
  const authData = await authRes.json();
  const token = authData.token;
  
  console.log('Got token. Searching for "rice"...');
  const res = await fetch(`${BASE_URL}/nutrition/search?q=rice`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

testSearch();
