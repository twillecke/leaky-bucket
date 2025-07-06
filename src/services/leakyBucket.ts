import dotenv from 'dotenv';
dotenv.config();

const BUCKET_CAPACITY = process.env.BUCKET_CAPACITY ? parseInt(process.env.BUCKET_CAPACITY, 10) : 5; // Default capacity
const BUCKET_REFILL_RATE = process.env.BUCKET_REFILL_RATE ? parseInt(process.env.BUCKET_REFILL_RATE, 10) : 5000; // Default refill rate

export default class LeakyBucket {
  public readonly createdAt: Date;
  public readonly userId: string;
  private capacity: number;
  private tokens: number;
  private intervalID: NodeJS.Timeout | null = null;

  constructor(userId: string) {
    this.createdAt = new Date();
    this.userId = userId;
    this.capacity = BUCKET_CAPACITY;
    this.tokens = this.capacity;
  }

  public start(): void {
    if (this.intervalID) return;
    this.intervalID = setInterval(() => {
      this.resetTokenCount();
    }, BUCKET_REFILL_RATE);
  }

  public stop(): void {
    if (this.intervalID) {
      clearInterval(this.intervalID);
      this.intervalID = null;
      this.resetTokenCount();
    }
  }

  public async getToken(): Promise<boolean> {
    if (this.tokens > 0) {
      this.decreaseToken();
      return true;
    }
    return false;
  }

  private async decreaseToken(): Promise<void> {
    if (this.tokens > 0) {
      this.tokens--;
    }
  }

  private resetTokenCount(): void {
    this.tokens = this.capacity;
  }
}