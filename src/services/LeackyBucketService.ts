import LeakyBucket from "./leakyBucket";
import BucketStorage from "./bucketStorage";

export default class LeakyBucketService {
  constructor(private storage: BucketStorage) { }

  async handleBucket(userId: string, wasSuccessful: boolean): Promise<{
    tokensLeft: number;
  }> {
    let bucket = await this.storage.getBucket(userId);
    if (!bucket) bucket = new LeakyBucket(userId);
    bucket.refillIfNeeded();
    if (!wasSuccessful) bucket.consumeToken();
    await this.storage.saveBucket(userId, bucket);
    return { tokensLeft: bucket.getTokensLeft() };
  }
}
