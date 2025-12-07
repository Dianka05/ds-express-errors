const { config, checkIsDev } = require('../config/config')
const HttpStatus = require('../constants/httpStatus')
const AppError = require('../errors/AppError')
const { logError } = require('../logger/logger')
const { mapErrorNameToPreset } = require('../presets/presets')

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        defaultErrorAnswer(err, req, res)
    } else {
        const genericError = mapErrorNameToPreset(err, req)
        defaultErrorAnswer(genericError, req, res)
    }
}

function defaultErrorAnswer(err, req, res) {
    logError(err, req)
    const isDev = checkIsDev()
    const options = {req, isDev}
    const resBody = config.formatError(err, options)
    res.status(err.statusCode).json(resBody)
}

function initGlobalHandlers(options = {}) {

    const { exitOnUnhandledRejection = true, exitOnUncaughtException = true, onCrash } = options

    const handleCrash = async (error) => {
        if (onCrash && typeof onCrash === 'function') {
            try {
                const cleanupOrPromise = onCrash(error);

                if (cleanupOrPromise instanceof Promise) {
                    await Promise.race([
                        cleanupOrPromise,
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Shutdown timed out (10s limit)')), 10000)
                        )
                    ]);
                }
            } catch (err) {
                console.error('⚠️ Error during graceful shutdown execution:', err);
            }
        }
        
        process.exit(1);
    }

    process.on('unhandledRejection', (reason) => {
        const errorMessage = reason instanceof Error ? reason.message : JSON.stringify(reason)
        logError(new AppError(`Unhandled Rejection: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR, false))
        if (exitOnUnhandledRejection) {
            handleCrash(reason)
        }
    })

    process.on('uncaughtException', (error) => {
        const msg = error instanceof Error ? error.message : JSON.stringify(error)
        logError(new AppError(`Uncaught Exception: ${msg}`, HttpStatus.INTERNAL_SERVER_ERROR, false))
        if (exitOnUncaughtException) {
            handleCrash(error)
        }
    })
}

module.exports = {errorHandler, initGlobalHandlers}