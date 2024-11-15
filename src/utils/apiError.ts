export class ApiError extends Error {
  status: number;
  error: string[];
  stack: string;
  code: string;
  success: boolean;
  message: string;

  constructor(
    message: string = 'server error',
    status: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    error: string[] = [],
    stack: string = '',
  ) {
    super(message);
    this.status = status;
    this.message = message;
    this.code = code;
    this.error = error;
    this.stack = stack;
    this.success = false;
  }
}
