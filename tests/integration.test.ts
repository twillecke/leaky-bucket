import { generateToken } from '../src/utils/generateToken';

test('POST /pix - single request', async () => {
  const response = await fetch('http://localhost:3000/pix', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${generateToken("test_id")}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pixId: 'test_pix_id',
    }),
  });

  console.log('Response:', response.status, response.statusText);
  const text = await response.text();
  console.log('Body:', text);
});

test('POST /pix - parallel requests to test rate limiting', async () => {
  const numberOfRequests = 20;
  const userId = 'test_user_parallel';

  // Create an array of request promises
  const requests = Array.from({ length: numberOfRequests }, (_, index) =>
    fetch('http://localhost:3000/pix', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${generateToken(userId)}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pixId: `test_pix_id_${index}`,
      }),
    })
  );

  console.log(`\n🚀 Making ${numberOfRequests} parallel requests...`);

  // Execute all requests in parallel
  const responses = await Promise.all(requests);

  // Process responses
  const results = await Promise.all(
    responses.map(async (response, index) => {
      const text = await response.text();
      return {
        index,
        status: response.status,
        statusText: response.statusText,
        body: text
      };
    })
  );

  // Analyze results
  const statusCounts = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  console.log('\n📊 Results Summary:');
  console.log('Status Code Distribution:', statusCounts);

  console.log('\n📝 Detailed Results:');
  results.forEach(result => {
    console.log(`Request ${result.index}: ${result.status} ${result.statusText} - ${result.body}`);
  });

  console.log('\n🔍 Check metrics at: http://localhost:3000/metrics');
}, 30000); // 30 second timeout for this test

test('Multiple users - parallel requests', async () => {
  const usersCount = 5;
  const requestsPerUser = 8;

  console.log(`\n👥 Testing ${usersCount} users making ${requestsPerUser} requests each...`);

  // Create requests for multiple users
  const allRequests: Array<{
    userId: string;
    requestIndex: number;
    promise: Promise<Response>;
  }> = [];

  for (let userId = 0; userId < usersCount; userId++) {
    for (let reqIndex = 0; reqIndex < requestsPerUser; reqIndex++) {
      allRequests.push({
        userId: `user_${userId}`,
        requestIndex: reqIndex,
        promise: fetch('http://localhost:3000/pix', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${generateToken(`user_${userId}`)}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pixId: `pix_${userId}_${reqIndex}`,
          }),
        })
      });
    }
  }

  // Execute all requests in parallel
  const responses = await Promise.all(allRequests.map(req => req.promise));

  // Process responses
  const results = await Promise.all(
    responses.map(async (response, index) => {
      const text = await response.text();
      return {
        userId: allRequests[index].userId,
        requestIndex: allRequests[index].requestIndex,
        status: response.status,
        body: text
      };
    })
  );

  // Group results by user
  const userResults: Record<string, Array<{
    userId: string;
    requestIndex: number;
    status: number;
    body: string;
  }>> = {};

  results.forEach(result => {
    if (!userResults[result.userId]) userResults[result.userId] = [];
    userResults[result.userId].push(result);
  });

  console.log('\n📊 Results by User:');
  Object.entries(userResults).forEach(([userId, userResponses]) => {
    const statusCounts = userResponses.reduce((acc, resp) => {
      acc[resp.status] = (acc[resp.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log(`${userId}: ${JSON.stringify(statusCounts)}`);
  });

  console.log('\n🔍 Check metrics at: http://localhost:3000/metrics');
}, 30000); // 30 second timeout
