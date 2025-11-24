const AppError = require('../errors/AppError')
const { logError } = require('../logger/logger')
const { mapErrorNameToPreset } = require('../presets/presets')

const isDev = process.env.NODE_ENV === 'development'

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        if (err.isOperational) { // expected error
            logError(err, req);
            res.status(err.statusCode).json({
                status: 'error',
                method: req.method,
                url: req.originalUrl,
                message: err.message,
                ...(isDev ? { stack: err.stack } : {})
            })
        } else { // unexpected error
            logError(err, req)
            res.status(err.statusCode).json({
                status: 'error',
                method: req.method,
                url: req.originalUrl,
                message: err.message,
                ...(isDev ? { stack: err.stack } : {})
            })
        }
    } else {
        const genericError = mapErrorNameToPreset(err);

        logError(genericError, req)
        res.status(genericError.statusCode).json({
            status: 'error',
            method: req.method,
            url: req.originalUrl,
            message: genericError.message,
            ...(isDev ? { stack: genericError.stack } : {}) 
        })
    }
}

process.on('unhandledRejection', (reason) => {
    const errorMessage = reason instanceof Error ? reason.message : JSON.stringify(reason);
    logError(new AppError(`Unhandled Rejection: ${errorMessage}`, 500, false));
    process.exit(1);
})

process.on('uncaughtException', (error) => {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    logError(new AppError(`Uncaught Exception: ${msg}`, 500, false));
    process.exit(1);
})

module.exports = {errorHandler}