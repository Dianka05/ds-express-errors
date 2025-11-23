class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational
        Error.captureStackTrace(this, this.constructor) // exclude constructor from stack trace
    }
}

module.exports = AppError