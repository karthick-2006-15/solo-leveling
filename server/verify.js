async function testPhase6() {
  const API_URL = 'http://localhost:5000/api';
  console.log('--- STARTING PHASE 6 VALIDATION ---');

  // Register/Login
  let resLogin = await fetch(API_URL + '/auth/register', { 
    method: 'POST', 
    headers: {'Content-Type': 'application/json'}, 
    body: JSON.stringify({name:'tester', email:'tester4@test.com', password:'password123'}) 
  });
  if (resLogin.status === 400 || resLogin.status === 409) {
    resLogin = await fetch(API_URL + '/auth/login', { 
      method: 'POST', 
      headers: {'Content-Type': 'application/json'}, 
      body: JSON.stringify({email:'tester4@test.com', password:'password123'}) 
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

  // 1. Log a weight
  console.log('Logging weight...');
  let res = await fetch(`${API_URL}/weight`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ weight: 75 })
  });
  let data = await res.json();
  console.log('Weight log result:', data.success);

  // 2. Fetch weight analytics
  console.log('Fetching weight analytics (month)...');
  res = await fetch(`${API_URL}/analytics/weight?granularity=month`, { headers });
  data = await res.json();
  console.log('Analytics data:', data.data);

  // 3. Log a workout to trigger "first_workout" achievement
  console.log('Logging a workout to trigger First Workout...');
  res = await fetch(`${API_URL}/workouts/sessions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Leg Day',
      durationMinutes: 60,
      totalVolume: 5000,
      exercises: []
    })
  });
  data = await res.json();
  console.log('Workout log achievements:', data.newlyUnlockedAchievements);

  // 4. Check all achievements
  console.log('Fetching all achievements...');
  res = await fetch(`${API_URL}/achievements`, { headers });
  data = await res.json();
  console.log('Achievements count:', data.achievements.length);
  const unlocked = data.achievements.filter(a => a.unlocked);
  console.log('Unlocked achievements:', unlocked.map(a => a.name));

  console.log('--- PHASE 6 VALIDATION COMPLETE ---');
}

testPhase6().catch(console.error);
