export default class PixService {
  constructor() { }

  static async handleRequest(): Promise<boolean> {
    const wasSuccessful = Math.random() > 0.5; // Simulate success/failure
    return wasSuccessful;
  }
}