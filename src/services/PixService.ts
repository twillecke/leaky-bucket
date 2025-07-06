export default class PixService {
  static queriedIds: string[] = [];
  constructor() { }

  static async handleRequest(pixId: string): Promise<boolean> {
    this.queriedIds.push(pixId);
    const wasSuccessful = Math.random() > 0.5; // Simulate success/failure
    return wasSuccessful;
  }
}