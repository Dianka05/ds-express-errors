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

    const handleCrash = () => {
        if (onCrash && typeof onCrash === 'function') {
            onCrash()
        } else process.exit(1)
    }

    process.on('unhandledRejection', (reason) => {
        const errorMessage = reason instanceof Error ? reason.message : JSON.stringify(reason)
        logError(new AppError(`Unhandled Rejection: ${errorMessage}`, HttpStatus.INTERNAL_SERVER_ERROR, false))
        if (exitOnUnhandledRejection) {
            handleCrash()
        }
    })

    process.on('uncaughtException', (error) => {
        const msg = error instanceof Error ? error.message : JSON.stringify(error)
        logError(new AppError(`Uncaught Exception: ${msg}`, HttpStatus.INTERNAL_SERVER_ERROR, false))
        if (exitOnUncaughtException) {
            handleCrash()
        }
    })
}

module.exports = {errorHandler, initGlobalHandlers}