export type RepositoryErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'UNAUTHORIZED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

export interface RepositoryError {
  code: RepositoryErrorCode;
  message: string;
  details?: unknown;
}

export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: RepositoryError;
    };

export function ok<T>(value: T): Result<T> {
  return {
    ok: true,
    value,
  };
}

export function err<T = never>(error: RepositoryError): Result<T> {
  return {
    ok: false,
    error,
  };
}
