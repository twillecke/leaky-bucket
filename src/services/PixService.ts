export default class PixService {
  static queriedIds: string[] = [];
  constructor() { }

  /**
   * Simulates a request to handle a Pix ID.
   */
  static async handleRequest(pixId: string): Promise<boolean> {
    this.queriedIds.push(pixId);
    const wasSuccessful = Math.random() > 0.5;
    return wasSuccessful;
  }
}