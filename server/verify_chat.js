async function verifyChat() {
  const API_URL = 'http://localhost:5000/api';
  console.log('--- STARTING PHASE 7 VALIDATION ---');

  // Register/Login
  let resLogin = await fetch(API_URL + '/auth/register', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({name:'tester_aria', email:'tester_aria@test.com', password:'password123'}) 
  });
  if (resLogin.status === 400 || resLogin.status === 409) {
    resLogin = await fetch(API_URL + '/auth/login', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({email:'tester_aria@test.com', password:'password123'}) 
    });
  }
  const loginData = await resLogin.json();
  const token = loginData.token;

  if (!token) {
    console.error('Failed to login:', loginData);
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test History (should be empty initially)
  console.log('Fetching history...');
  let res = await fetch(`${API_URL}/assistant/history`, { headers });
  let data = await res.json();
  console.log('History count:', data.history?.length);

  // Note: We don't have OPENAI_API_KEY in process.env so the chat will fail with 502. 
  // Let's at least test that it responds and handles the error gracefully.
  console.log('Testing chat endpoint (expecting 502 without API key)...');
  res = await fetch(`${API_URL}/assistant/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message: 'Hello ARIA' })
  });

  console.log('Chat status:', res.status);
  if (res.status === 502) {
    const errorData = await res.json();
    console.log('Chat error response:', errorData);
  } else {
    // If we have an API key, it might stream
    console.log('Chat response headers:', res.headers.get('content-type'));
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let result = await reader.read();
    while(!result.done) {
      console.log('Stream chunk:', decoder.decode(result.value));
      result = await reader.read();
    }
  }
}

verifyChat().catch(console.error);
