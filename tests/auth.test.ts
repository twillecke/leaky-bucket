import { generateToken } from "../src/utils/generateToken";

// should return 401 if no token is present in Authorization Header
test('should return 401 if no token is present in request Authorization Header', async () => {
  const request = await fetch('http://localhost:3000/auth', {
    method: 'GET',
  });
  expect(request.status).toBe(401);
  const data = await request.json();
  expect(data.error).toBe('Missing or invalid Authorization header');
});

// should return 401 if token is invalid or expired
test('should return 401 if token is invalid or expired', async () => {
  const request = await fetch('http://localhost:3000/auth', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer invalid_token'
    }
  });
  expect(request.status).toBe(401);
  const data = await request.json();
  expect(data.error).toBe('Invalid or expired token');
});

// should return 200 and userId if token is valid
test('should return 200 and userId if token is valid', async () => {
  const token = generateToken('test_user_id');
  const request = await fetch('http://localhost:3000/auth', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  expect(request.status).toBe(200);
  const data = await request.json();
  expect(data.message).toBe('Authorized');
  expect(data.userId).toBe('test_user_id');
});