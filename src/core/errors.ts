export class CoreError extends Error {
  constructor(public readonly code: string, message: string, public readonly details: unknown = null) {
    super(message);
    this.name = 'CoreError';
  }
}
