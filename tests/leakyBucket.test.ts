import LeakyBucket from '../src/services/leakyBucket';

describe('LeakyBucket', () => {
  let buckets: LeakyBucket[] = [];

  beforeEach(() => {
    buckets = [];
  });

  afterEach(async () => {
    // Clean up all buckets to prevent memory leaks and ensure graceful shutdown
    buckets.forEach(bucket => {
      try {
        bucket.stop();
      } catch (error) {
        console.warn('Error stopping bucket:', error);
      }
    });
    buckets = [];

    // Give a small delay to ensure all intervals are cleared
    await new Promise(resolve => setTimeout(resolve, 10));
  });

  test('LeakyBucket should start with full capacity', async () => {
    const bucket = new LeakyBucket('test_id');
    buckets.push(bucket);
    expect(await bucket.getToken()).toBe(true);
  });

  test('LeakyBucket should allow requests until capacity is reached', async () => {
    const bucket = new LeakyBucket('test_id');
    buckets.push(bucket);
    bucket.start();

    // Quickly consume tokens to test rate limiting
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    // Should be at capacity now (5 tokens by default)
    expect(await bucket.getToken()).toBe(false);
  });

  test('LeakyBucket should reset token count over set interval', async () => {
    const bucket = new LeakyBucket('test_id');
    buckets.push(bucket);
    bucket.start();

    // Consume all tokens
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(true);
    expect(await bucket.getToken()).toBe(false); // Should be empty now

    // Wait for refill (BUCKET_REFILL_RATE is 5000ms by default)
    await new Promise(resolve => setTimeout(resolve, 5100));

    // Should have tokens again after refill
    expect(await bucket.getToken()).toBe(true);
  }, 8000);
});