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
  expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
  expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
  expect(response.headers.get('X-RateLimit-Reset')).toBeDefined();
});


test('POST /pix - parallel requests to test rate limiting', async () => {
  const numberOfRequests = 20;
  const userId = 'test_user_parallel';
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
  const responses = await Promise.all(requests);
  const results = await Promise.all(
    responses.map(async (response, index) => {
      const text = await response.text();
      return {
        index,
        status: response.status,
        statusText: response.statusText,
        body: text,
        headers: {
          'X-RateLimit-Limit': response.headers.get('X-RateLimit-Limit'),
          'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining'),
          'X-RateLimit-Reset': response.headers.get('X-RateLimit-Reset'),
        },
      };
    })
  );
  results.forEach(result => {
    expect(result.headers['X-RateLimit-Limit']).toBeDefined();
    expect(result.headers['X-RateLimit-Remaining']).toBeDefined();
    expect(result.headers['X-RateLimit-Reset']).toBeDefined();
  });
});

test('Multiple users - parallel requests', async () => {
  const usersCount = 5;
  const requestsPerUser = 8;
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
  const responses = await Promise.all(allRequests.map(req => req.promise));
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
}, 30000); // 30 second timeout