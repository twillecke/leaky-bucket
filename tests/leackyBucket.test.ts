import LeakyBucket from '../src/domain/LeakyBucket';

describe('LeakyBucket', () => {
  const userId = 'test-user';

  test('should initialize with default tokens', () => {
    const bucket = new LeakyBucket(userId);
    expect(bucket.getTokensLeft()).toBe(5); // default from .env or fallback
    expect(bucket.hasAvailableTokens()).toBe(true);
  });

  test('should consume token if available', () => {
    const bucket = new LeakyBucket(userId, 3);
    bucket.consumeToken();
    expect(bucket.getTokensLeft()).toBe(2);
  });

  test('should not go below zero tokens', () => {
    const bucket = new LeakyBucket(userId, 0);
    bucket.consumeToken();
    expect(bucket.getTokensLeft()).toBe(0);
    expect(bucket.hasAvailableTokens()).toBe(false);
  });

  test('should not consume if tokens are 0', () => {
    const bucket = new LeakyBucket(userId, 0);
    expect(bucket.hasAvailableTokens()).toBe(false);
  });

  test('should refill tokens after enough time', () => {
    // Set refilledAt to 6 seconds ago (more than 5-second interval)
    const oldTime = new Date(Date.now() - 6000); // 6 seconds ago
    const bucket = new LeakyBucket(userId, 2, oldTime);
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(5); // Should refill to capacity
  });

  test('should not refill if less than 5 seconds passed', () => {
    const recentTime = new Date(Date.now() - 3000); // 3 seconds ago (less than 5-second interval)
    const bucket = new LeakyBucket(userId, 2, recentTime);
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(2); // Should not refill yet
  });

  test('should serialize and deserialize correctly', () => {
    const original = new LeakyBucket(userId, 3, new Date('2020-01-01T00:00:00Z'));
    const json = original.toJSON();
    const restored = LeakyBucket.fromJSON(json);

    expect(restored.getTokensLeft()).toBe(3);
    expect(restored.userId).toBe(userId);
    expect(restored.refilledAt.toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });
});
