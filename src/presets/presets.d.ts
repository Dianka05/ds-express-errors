const AppError = require("../errors/AppError");

export function BadRequest(message?: string): AppError
export function Unauthorized(message?: string): AppError
export function PaymentRequired(message?: string): AppError
export function Forbidden(message?: string): AppError
export function NotFound(message?: string): AppError

export function InternalServerError(message?: string, isOperational?: boolean): AppError
export function NotImplemented(message?: string): AppError
export function ServiceUnavailable(message?: string): AppError
export function BadGateway(message?: string): AppError


export function mapErrorNameToPreset(err: AppError, req?: Request): AppError
