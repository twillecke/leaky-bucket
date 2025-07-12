import { createClient, type RedisClientType } from 'redis';

const BUCKET_CAPACITY = parseInt(process.env.BUCKET_CAPACITY || '5', 10);
const BUCKET_REFILL_RATE = parseInt(process.env.BUCKET_REFILL_RATE || '5000', 10); // in ms

export default class BucketStorageDatabase {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
    this.client.on('error', err => console.log('Redis Client Error', err));
  }

  public async connect() {
    await this.client.connect();
  }

  public async disconnect() {
    await this.client.quit();
  }

  // Get tokens left for a user
  public async getTokensLeft(userId: string): Promise<number> {
    const tokens = await this.client.get(`rate_limit:${userId}`);
    if (tokens === null) {
      // No key means bucket is full (refilled)
      return BUCKET_CAPACITY;
    }
    return parseInt(tokens, 10);
  }

  // Try to consume a token, returns true if successful, false if rate limited
  public async consumeToken(userId: string): Promise<{ allowed: boolean; tokensLeft: number; reset: number }> {
    const key = `rate_limit:${userId}`;
    const tokens = await this.client.get(key);

    if (tokens === null) {
      // Bucket is full, consume one and set TTL
      await this.client.set(key, (BUCKET_CAPACITY - 1).toString(), {
        EX: Math.ceil(BUCKET_REFILL_RATE / 1000),
      });
      return {
        allowed: true,
        tokensLeft: BUCKET_CAPACITY - 1,
        reset: Math.floor(Date.now() / 1000) + Math.ceil(BUCKET_REFILL_RATE / 1000),
      };
    }

    let tokensLeft = parseInt(tokens, 10);
    if (tokensLeft > 0) {
      tokensLeft -= 1;
      // Only update value, TTL remains the same
      await this.client.set(key, tokensLeft.toString(), { KEEPTTL: true });
      const ttl = await this.client.ttl(key);
      return {
        allowed: true,
        tokensLeft,
        reset: Math.floor(Date.now() / 1000) + ttl,
      };
    } else {
      // Rate limit exceeded
      const ttl = await this.client.ttl(key);
      return {
        allowed: false,
        tokensLeft: 0,
        reset: Math.floor(Date.now() / 1000) + ttl,
      };
    }
  }
}