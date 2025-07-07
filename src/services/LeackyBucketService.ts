import BucketStorage from "./BucketStorage";
import LeakyBucket from "./LeakyBucket";

export default class LeakyBucketService {
  constructor(private storage: BucketStorage) { }

  async hasAvailableTokens(userId: string): Promise<boolean> {
    let bucket = await this.storage.getBucket(userId);
    if (!bucket) {
      bucket = new LeakyBucket(userId);
      await this.storage.saveBucket(userId, bucket);
    }
    bucket.refillIfNeeded();
    return bucket.hasAvailableTokens();
  }

  async handleBucketAfterRequest(userId: string, wasSuccessful: boolean): Promise<{
    tokensLeft: number;
  }> {
    const bucket = await this.storage.getBucket(userId);
    if (!wasSuccessful) {
      bucket.consumeToken();
    }
    await this.storage.saveBucket(userId, bucket);
    return { tokensLeft: bucket.getTokensLeft() };
  }
}
