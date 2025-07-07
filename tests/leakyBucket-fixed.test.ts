import LeakyBucket from '../src/services/LeakyBucket';

describe('LeakyBucket Rate Limiting Algorithm', () => {
  const userId = 'test-user';

  test('should initialize with default capacity (5 tokens)', () => {
    const bucket = new LeakyBucket(userId);
    expect(bucket.getTokensLeft()).toBe(5);
    expect(bucket.hasAvailableTokens()).toBe(true);
  });

  test('should consume tokens correctly', () => {
    const bucket = new LeakyBucket(userId);

    // Consume all 5 tokens
    bucket.consumeToken();
    expect(bucket.getTokensLeft()).toBe(4);

    bucket.consumeToken();
    bucket.consumeToken();
    bucket.consumeToken();
    bucket.consumeToken();
    expect(bucket.getTokensLeft()).toBe(0);
    expect(bucket.hasAvailableTokens()).toBe(false);
  });

  test('should not refill immediately (within 5 seconds)', () => {
    const bucket = new LeakyBucket(userId);

    // Consume all tokens
    bucket.consumeToken();
    bucket.consumeToken();
    bucket.consumeToken();
    bucket.consumeToken();
    bucket.consumeToken();
    expect(bucket.getTokensLeft()).toBe(0);

    // Check immediately - should still be 0
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(0);
  });

  test('should refill tokens after time interval', () => {
    // Create bucket with a past refill time (simulate 6 seconds ago)
    const pastDate = new Date(Date.now() - 6000); // 6 seconds ago
    const bucket = new LeakyBucket(userId, 0, pastDate); // 0 tokens, refilled 6 seconds ago

    // Refill should happen since 6 seconds > 5 seconds (BUCKET_REFILL_RATE)
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(5); // Should be refilled to capacity
  });

  test('should handle multiple refill intervals correctly', () => {
    // Create bucket with refill time 12 seconds ago (2 intervals)
    const pastDate = new Date(Date.now() - 12000); // 12 seconds ago
    const bucket = new LeakyBucket(userId, 2, pastDate); // 2 tokens remaining

    // Should refill: 2 intervals passed, each adds 5 tokens, but cap at 5
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(5); // Should be capped at capacity
  });

  test('should serialize and deserialize correctly', () => {
    const bucket = new LeakyBucket(userId, 3);
    const json = bucket.toJSON();

    expect(json.userId).toBe(userId);
    expect(json.tokens).toBe(3);
    expect(json.refilledAt).toBeDefined();

    const restoredBucket = LeakyBucket.fromJSON(json);
    expect(restoredBucket.userId).toBe(userId);
    expect(restoredBucket.getTokensLeft()).toBe(3);
  });
});
