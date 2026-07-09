import http from 'http';

let token = '';
const _userId = '6662e086f6fcd153641ec923';

async function fetchAPI(endpoint: string, method: string, body?: any, auth: boolean = true) {
  const headers: any = { 'Content-Type': 'application/json' };
  
  return new Promise<any>((resolve, reject) => {
    const options: http.RequestOptions = {
      hostname: 'localhost',
      port: 5000,
      path: `/api${endpoint}`,
      method,
      headers
    };

    if (auth && token) {
      // (options.headers as any)['Cookie'] = `token=${token}`;
      (options.headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed;
        try { parsed = JSON.parse(data); } catch (_e) { parsed = data; }
        
        const setCookie = res.headers['set-cookie'];
        if (setCookie) {
          const tokenMatch = setCookie[0].match(/token=([^;]+)/);
          if (tokenMatch) token = tokenMatch[1];
        }

        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING REAL DB E2E SUITE ---');

  const randomEmail = `qa_${Math.random().toString(36).substring(7)}@system.com`;
  let passCount = 0;
  let failCount = 0;

  const assert = (condition: boolean, msg: string, data?: any) => {
    if (condition) {
      console.log(`✅ ${msg}`);
      passCount++;
    } else {
      console.log(`❌ FAILED: ${msg}`, data || '');
      failCount++;
    }
  };

  // 1. Auth Registration
  console.log('\\n[AUTH] User Registration');
  let res = await fetchAPI('/auth/register', 'POST', {
    name: 'RealHunter',
    email: randomEmail,
    password: 'password123'
  }, false);
  assert(res.status === 201, 'Registration successful');
  
  // 2. Auth Login
  console.log('\\n[AUTH] User Login');
  res = await fetchAPI('/auth/login', 'POST', {
    email: randomEmail,
    password: 'password123'
  }, false);
  assert(res.status === 200 && !!token, 'Login successful & JWT HttpOnly Cookie extracted');

  // 3. Profile & Progression
  console.log('\\n[PROGRESSION] Fetch Profile');
  res = await fetchAPI('/progression/me', 'GET');
  assert(!!(res.status === 200 && res.body.progression && res.body.progression.level === 1), 'Progression retrieved successfully', res.body);

  // 4. Create Habit
  console.log('\\n[HABITS] Create Habit');
  res = await fetchAPI('/habits', 'POST', {
    name: '100 Pushups',
    category: 'strength',
    frequency: 'daily',
    icon: 'dumbbell'
  });
  assert(res.status === 201, 'Habit created successfully', res.body);
  const _habitId = res.body.habit?._id;

  // 5. Create Workout
  console.log('\\n[WORKOUTS] Create Session');
  res = await fetchAPI('/workouts/sessions', 'POST', {
    name: 'Morning Raid',
    duration: 60,
    exercises: [
      { 
        name: 'Pushups', 
        sets: [
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 },
          { reps: 10, weight: 0 }
        ] 
      }
    ]
  });
  // Note: The endpoint might be different depending on schema. If 404 or 400, we'll see it.
  assert([200, 201].includes(res.status), 'Workout session created', res.body);

  // 6. Log Nutrition
  console.log('\\n[NUTRITION] Log Food');
  res = await fetchAPI('/nutrition/log', 'POST', {
    mealType: 'lunch',
    rawDescription: 'Monster Meat',
    servingDescription: '1 portion',
    nutrients: {
      calories: 800,
      protein: 60,
      carbs: 20,
      fat: 30
    }
  });
  assert([200, 201].includes(res.status), 'Nutrition logged successfully', res.body);

  // 7. Track Water
  console.log('\\n[NUTRITION] Track Water');
  res = await fetchAPI('/nutrition/water', 'POST', { amountMl: 500 });
  assert([200, 201].includes(res.status), 'Water tracked successfully', res.body);

  // 8. Update Skills
  console.log('\\n[SKILLS] Gain Skill XP');
  // First get skills
  res = await fetchAPI('/skills', 'GET');
  assert(res.status === 200, 'Skills retrieved', res.body);
  // Assuming there's an endpoint to add XP. Let's hit the AI to simulate progression.
  
  // 9. AI Assistant
  console.log('\\n[AI] AI Assistant Query');
  res = await fetchAPI('/ai/ask', 'POST', { message: 'stats' });
  assert(!!(res.status === 200 && res.body.reply), 'AI replied contextually', res.body);

  // 10. Dashboard
  console.log('\\n[DASHBOARD] Fetch Analytics');
  // Usually this is multiple calls, we'll simulate fetching workouts
  res = await fetchAPI('/workouts/sessions', 'GET');
  assert(res.status === 200, 'Dashboard Analytics (Workouts) retrieved', res.body);

  // 11. Auth Logout
  console.log('\\n[AUTH] Logout');
  res = await fetchAPI('/auth/logout', 'GET');
  assert(res.status === 200, 'Logout successful', res.body);

  // 12. Verify Expiration
  console.log('\\n[AUTH] Verify Protected Route after Logout');
  res = await fetchAPI('/progression/me', 'GET');
  assert(res.status === 401, 'Properly rejected after logout', res.body);

  console.log('\\n--- SUMMARY ---');
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${failCount}`);
  
  if (failCount > 0) {
    process.exit(1);
  }
}

runTests().catch(console.error);
