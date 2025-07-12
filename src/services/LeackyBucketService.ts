import LeakyBucket from "../domain/LeakyBucket";
import type BucketStorage from "../repo/BucketStorageMemory";

export default class LeakyBucketService {
  constructor(private storage: BucketStorage) { }

  public async hasAvailableTokens(userId: string): Promise<boolean> {
    let bucket = await this.storage.getBucket(userId);
    if (!bucket) {
      bucket = new LeakyBucket(userId);
      await this.storage.saveBucket(userId, bucket);
    }
    bucket.refillIfNeeded();
    return bucket.hasAvailableTokens();
  }

  public async handleBucketAfterRequest(userId: string, wasSuccessful: boolean): Promise<{
    tokensLeft: number;
  }> {
    const bucket = await this.storage.getBucket(userId);
    if (!wasSuccessful) bucket.consumeToken();
    await this.storage.saveBucket(userId, bucket);
    return { tokensLeft: bucket.getTokensLeft() };
  }

  public async getBucketInfo(userId: string): Promise<{
    limit: number;
    remaining: number;
    reset: number;
  }> {
    let bucket = await this.storage.getBucket(userId);
    if (!bucket) {
      bucket = new LeakyBucket(userId);
      await this.storage.saveBucket(userId, bucket);
    }
    bucket.refillIfNeeded();
    const limit = bucket.getCapacity();
    const remaining = bucket.getTokensLeft();
    const reset = bucket.getNextRefillTime();
    return { limit, remaining, reset };
  }
}
