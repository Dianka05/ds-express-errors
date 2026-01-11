import { AppError } from '../errors/AppError';

export function BadRequest(message?: string): AppError
export function Unauthorized(message?: string): AppError
export function PaymentRequired(message?: string): AppError
export function Forbidden(message?: string): AppError
export function NotFound(message?: string): AppError
export function Conflict(message?: string): AppError
export function UnprocessableContent(message?: string): AppError
export function TooManyRequests(message?: string): AppError

export function InternalServerError(message?: string, isOperational?: boolean): AppError
export function NotImplemented(message?: string): AppError
export function ServiceUnavailable(message?: string): AppError
export function BadGateway(message?: string): AppError