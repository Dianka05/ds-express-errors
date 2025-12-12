import { AppError } from './src/errors/AppError'

export * from './src/errors/AppError'
export * from './src/logger/logger'
export * from './src/middleware/errorHandler'
export * from './src/middleware/asyncHandler' 
export * from './src/presets/presets'
export * from './src/config/config'

export const Errors: {
    BadRequest(message?: string): AppError
    Unauthorized(message?: string): AppError
    PaymentRequired(message?: string): AppError
    Forbidden(message?: string): AppError
    NotFound(message?: string): AppError
    Conflict(message?: string): AppError
    TooManyRequests(message?: string): AppError
    InternalServerError(message?: string, isOperational?: boolean): AppError
    NotImplemented(message?: string): AppError
    BadGateway(message?: string): AppError
    ServiceUnavailable(message?: string): AppError
}