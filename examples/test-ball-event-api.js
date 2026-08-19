/**
 * Test script for Ball Event API
 * Run with: node examples/test-ball-event-api.js
 */

const API_BASE = 'http://localhost:3000';

// Helper function to make API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return null;
  }
}

// Test scenarios
async function testBallEventAPI() {
  console.log('='.repeat(60));
  console.log('Testing Ball Event API');
  console.log('='.repeat(60));

  // 1. Test: Get all ball events
  console.log('\n--- TEST 1: Get All Ball Events ---');
  await apiCall('GET', '/admin/ball-event?page=1&limit=10');

  // 2. Test: Create a ball event (normal delivery)
  console.log('\n--- TEST 2: Create Normal Ball Event (1 run) ---');
  const ballEvent1 = await apiCall('POST', '/admin/ball-event', {
    matchId: 1,
    inningsId: 1,
    overNumber: 0,
    ballInOver: 1,
    batsmanId: 1,
    bowlerId: 2,
    nonStrikerId: 3,
    runsBatsman: 1,
    runsExtras: 0,
    extraType: null,
    wicket: false,
    wicketType: null,
    commentaryText: 'Good length delivery, pushed to mid-off for a single',
    ballTimestamp: new Date().toISOString(),
  });

  let ballEventId = ballEvent1?.data?.id;

  // 3. Test: Create a boundary (4 runs)
  console.log('\n--- TEST 3: Create Boundary (FOUR) ---');
  await apiCall('POST', '/admin/ball-event', {
    matchId: 1,
    inningsId: 1,
    overNumber: 0,
    ballInOver: 2,
    batsmanId: 1,
    bowlerId: 2,
    nonStrikerId: 3,
    runsBatsman: 4,
    runsExtras: 0,
    extraType: null,
    wicket: false,
    wicketType: null,
    commentaryText: 'Short and wide, cut away for FOUR!',
    ballTimestamp: new Date().toISOString(),
  });

  // 4. Test: Create a six
  console.log('\n--- TEST 4: Create Boundary (SIX) ---');
  await apiCall('POST', '/admin/ball-event', {
    matchId: 1,
    inningsId: 1,
    overNumber: 0,
    ballInOver: 3,
    batsmanId: 1,
    bowlerId: 2,
    nonStrikerId: 3,
    runsBatsman: 6,
    runsExtras: 0,
    extraType: null,
    wicket: false,
    wicketType: null,
    commentaryText: 'Tossed up, smashed over long-on for SIX!',
    ballTimestamp: new Date().toISOString(),
  });

  // 5. Test: Create a wicket
  console.log('\n--- TEST 5: Create Wicket Event ---');
  await apiCall('POST', '/admin/ball-event', {
    matchId: 1,
    inningsId: 1,
    overNumber: 0,
    ballInOver: 4,
    batsmanId: 1,
    bowlerId: 2,
    nonStrikerId: 3,
    runsBatsman: 0,
    runsExtras: 0,
    extraType: null,
    wicket: true,
    wicketType: 'Bowled',
    dismissedPlayerId: 1,
    fielderId: null,
    commentaryText: 'Bowled! The stumps are shattered!',
    ballTimestamp: new Date().toISOString(),
  });

  // 6. Test: Create a wide
  console.log('\n--- TEST 6: Create Wide Ball ---');
  await apiCall('POST', '/admin/ball-event', {
    matchId: 1,
    inningsId: 1,
    overNumber: 0,
    ballInOver: 4,
    batsmanId: 3,
    bowlerId: 2,
    nonStrikerId: 4,
    runsBatsman: 0,
    runsExtras: 1,
    extraType: 'Wide',
    wicket: false,
    wicketType: null,
    commentaryText: 'Wide down the leg side',
    ballTimestamp: new Date().toISOString(),
  });

  // 7. Test: Get ball event by ID
  if (ballEventId) {
    console.log('\n--- TEST 7: Get Ball Event by ID ---');
    await apiCall('GET', `/admin/ball-event/${ballEventId}`);
  }

  // 8. Test: Update ball event
  if (ballEventId) {
    console.log('\n--- TEST 8: Update Ball Event ---');
    await apiCall('PUT', `/admin/ball-event/${ballEventId}`, {
      commentaryText: 'Updated commentary: Nicely played for a single',
      runsBatsman: 1,
    });
  }

  // 9. Test: Get ball events by match
  console.log('\n--- TEST 9: Get Ball Events by Match ---');
  await apiCall('GET', '/admin/ball-event/match/1');

  // 10. Test: Get ball events by innings
  console.log('\n--- TEST 10: Get Ball Events by Innings ---');
  await apiCall('GET', '/admin/ball-event/innings/1');

  // 11. Test: Filter ball events (wickets only)
  console.log('\n--- TEST 11: Filter Ball Events (Wickets Only) ---');
  await apiCall('GET', '/admin/ball-event?wicket=true');

  // 12. Test: Delete ball event
  if (ballEventId) {
    console.log('\n--- TEST 12: Delete Ball Event ---');
    await apiCall('DELETE', `/admin/ball-event/${ballEventId}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Testing Complete!');
  console.log('='.repeat(60));
  console.log('\nNote: Make sure you have:');
  console.log('1. Server running on port 3000');
  console.log('2. Valid matchId (1), inningsId (1), and player IDs in database');
  console.log('3. Socket.IO client connected to see real-time updates');
  console.log('\nOpen examples/socket-client-example.html to see live updates!');
}

// Run tests
testBallEventAPI().catch(console.error);

