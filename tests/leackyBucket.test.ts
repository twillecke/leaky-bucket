import LeakyBucket from '../src/services/leakyBucket';

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
    // Set refilledAt to 3 hours ago
    const oldTime = new Date(Date.now() - 3 * 3600000); // 3 hours ago
    const bucket = new LeakyBucket(userId, 2, oldTime);
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(5); // capacity capped at 5
  });

  test('should not refill if less than an hour passed', () => {
    const recentTime = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    const bucket = new LeakyBucket(userId, 2, recentTime);
    bucket.refillIfNeeded();
    expect(bucket.getTokensLeft()).toBe(2);
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
