const AppError = require('../errors/AppError')
const { logError, logInfo, logWarning } = require('../logger/logger')

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {

        if (err.isOperational) { // expected error
            logWarning(err.message);
            res.status(err.statusCode).json({
                status: 'warning',
                message: err.message,
            })
        } else { // unexpected error
            logError(err)
            res.status(err.statusCode).json({
                status: 'error',
                message: err.message,
                stack: err.stack
            })
        }
    } else {
        const genericError = new AppError(err.message, err?.statusCode || 500, false)
        logError(genericError)
        res.status(genericError.statusCode).json({
            status: 'error',
            message: genericError.message,
            // stack: genericError.stack
        })
    }
}

module.exports = {errorHandler}