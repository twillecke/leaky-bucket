import LeakyBucket from "./leakyBucket";

export default class BucketStorage {
  private buckets: Map<string, LeakyBucket>;

  constructor() {
    this.buckets = new Map();
  }

  public async getBucket(userId: string): Promise<LeakyBucket> {
    if (!this.buckets.has(userId)) {
      const bucket = new LeakyBucket(userId);
      this.buckets.set(userId, bucket);
    }
    return this.buckets.get(userId)!;
  }

  public async saveBucket(userId: string, bucket: LeakyBucket): Promise<void> {
    this.buckets.set(userId, bucket);
  }
}
