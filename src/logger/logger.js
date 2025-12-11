const { config } = require("../config/config")
const { checkLoggerExist } = require("../config/config")
const { checkIsDev } = require("../config/config")


function logError(error, req) {
    const isDevEnvironment = checkIsDev()
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = error.message || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = isDevEnvironment ? error.stack : undefined
        const code = error.code ? `[${error.code}]` : ''
        const name = error.name || ''

        if (checkLoggerExist()) {
            config.customLogger.error(`[${timestamp}] ${req?.method || ''} ${req?.originalUrl || ''} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
        } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'error']`)
            console.error(`[${timestamp}] ${req?.method || ''} ${req?.originalUrl || ''} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
        }
    }
}

function logInfo(message) {
    const timestamp = getTimestamp()

    if (checkLoggerExist()) {
        config.customLogger.info(`[${timestamp}] - [INFO]: ${message}`)
    } else {
        if (config.customLogger) console.warn(`[Logger is connected but not contain 'info']`)
        console.log(`[${timestamp}] - [INFO]: ${message}`)
    }
}

function logWarning(message, req) {
    const timestamp = getTimestamp()

    if (checkLoggerExist()) {
        config.customLogger.warn(`[${timestamp}] - ${req?.method || ''} ${req?.originalUrl || ''} \n[WARNING]: ${message}`)
    } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'warn']`)
        console.warn(`[${timestamp}] - ${req?.method || ''} ${req?.originalUrl || ''} \n[WARNING]: ${message}`)
    }
}

function logDebug(message, req) {
    const timestamp = getTimestamp()

    if (checkLoggerExist()) {
        config.customLogger.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${req?.originalUrl || ''} [Message]: ${message}`)
    } else {
        if (config.customLogger) console.warn(`[Logger is connected but not contain 'debug']`)
        console.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${req?.originalUrl || ''} [Message]: ${message}`)
    }
}

const getTimestamp = () => {
    return new Date().toISOString()
}

module.exports = {
    logError,
    logInfo,
    logWarning,
    logDebug
}