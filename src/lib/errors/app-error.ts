export class AppError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: unknown
  ) {
    super(message);

    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;

    // importante para instanceof
    Object.setPrototypeOf(this, AppError.prototype);
  }
}