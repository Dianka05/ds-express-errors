const { config } = require("../config/config")
const { checkLoggerExist } = require("../config/config")
const { checkIsDev } = require("../config/config")


function logError(error, req) {
    const isDevEnvironment = checkIsDev()
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = safeMessage(error.message) || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = isDevEnvironment ? error.stack : undefined
        const code = error.code ? `[${error.code}]` : ''
        const name = error.name || ''

        const url = req.originalUrl ? safeUrl(req.originalUrl) : ''

        if (checkLoggerExist()) {
            config.customLogger.error(`[${timestamp}] ${req?.method || ''} ${url} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
        } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'error']`)
            console.error(`[${timestamp}] ${req?.method || ''} ${url} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
        }
    }
}

function logInfo(rawMessage) {
    const timestamp = getTimestamp()
    const message = safeMessage(rawMessage)

    if (checkLoggerExist()) {
        config.customLogger.info(`[${timestamp}] - [INFO]: ${message}`)
    } else {
        if (config.customLogger) console.warn(`[Logger is connected but not contain 'info']`)
        console.log(`[${timestamp}] - [INFO]: ${message}`)
    }
}

function logWarning(rawMessage, req) {
    const timestamp = getTimestamp()

    const message = safeMessage(rawMessage)
    const url = req.originalUrl ? safeUrl(req.originalUrl) : ''


    if (checkLoggerExist()) {
        config.customLogger.warn(`[${timestamp}] - ${req?.method || ''} ${url} \n[WARNING]: ${message}`)
    } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'warn']`)
        console.warn(`[${timestamp}] - ${req?.method || ''} ${url} \n[WARNING]: ${message}`)
    }
}

function logDebug(rawMessage, req) {
    const timestamp = getTimestamp()

    const message = safeMessage(rawMessage)
    const url = req.originalUrl ? safeUrl(req.originalUrl) : ''

    if (checkLoggerExist()) {
        config.customLogger.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${url} [Message]: ${message}`)
    } else {
        if (config.customLogger) console.warn(`[Logger is connected but not contain 'debug']`)
        console.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${url} [Message]: ${message}`)
    }
}

const getTimestamp = () => {
    return new Date().toISOString()
}

const safeUrl = (url) => {
    return url.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
}

const safeMessage = (msg) => {
    if (typeof msg !== 'string') return ''
    return msg.replace(/[\r\n]/g, '')
}

module.exports = {
    logError,
    logInfo,
    logWarning,
    logDebug
}