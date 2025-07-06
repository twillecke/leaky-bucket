import dotenv from 'dotenv';
dotenv.config();

const BUCKET_CAPACITY = parseInt(process.env.BUCKET_CAPACITY || '5', 10);
const BUCKET_REFILL_RATE = parseInt(process.env.BUCKET_REFILL_RATE || '5000', 10);

export default class LeakyBucket {
  public refilledAt: Date;
  public userId: string;
  private capacity: number;
  private tokens: number;

  constructor(userId: string, tokens = BUCKET_CAPACITY, refilledAt = new Date()) {
    this.userId = userId;
    this.tokens = tokens;
    this.refilledAt = refilledAt;
    this.capacity = BUCKET_CAPACITY;
  }

  public consumeToken(): void {
    if (this.tokens > 0) this.tokens -= 1;
  }

  public getTokensLeft(): number {
    return this.tokens;
  }

  public hasAvailableTokens(): boolean {
    this.refillIfNeeded();
    return this.tokens > 0;
  }

  public refillIfNeeded(): void {
    const now = new Date();
    const elapsed = now.getTime() - this.refilledAt.getTime();
    if (elapsed > BUCKET_REFILL_RATE) {
      const hoursPassed = Math.floor(elapsed / 3600000); // ms to hours
      if (hoursPassed > 0) {
        this.tokens = Math.min(this.capacity, this.tokens + hoursPassed);
        this.refilledAt = now;
      }
    }
  }

  public toJSON() {
    return {
      userId: this.userId,
      tokens: this.tokens,
      refilledAt: this.refilledAt.toISOString(),
    };
  }

  public static fromJSON(data: { userId: string; tokens: number; refilledAt: string }): LeakyBucket {
    return new LeakyBucket(data.userId, data.tokens, new Date(data.refilledAt));
  }
}
