export class AppError extends Error {
    constructor(message: string, statusCode: number, isOperational?: boolean);
    statusCode: number;
    isOperational: boolean;
}