const { config } = require("../config/config")
const { checkLoggerExist } = require("../config/config")
const { checkIsDev } = require("../config/config")

let rateLimiters;

function logError(error, req) {

    const isLogAllowed = checkRateLimit()

    if (!isLogAllowed) return
    
    const isDevEnvironment = checkIsDev()
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = safeMessage(error.message) || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = isDevEnvironment ? error.stack : undefined
        const code = error.code ? `[${error.code}]` : ''
        const name = error.name || ''

        const url = req?.originalUrl ? safeUrl(req.originalUrl) : ''

        if (checkLoggerExist()) {
            config.customLogger.error(`[${timestamp}] ${req?.method || ''} ${url} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
        } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'error']`)
            console.error(`\x1b[31m [${timestamp}] ${req?.method || ''} ${url} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n \x1b[0m`)
        }
    }
}

function logInfo(rawMessage) {

    const isLogAllowed = checkRateLimit()

    if (!isLogAllowed) return

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

    const isLogAllowed = checkRateLimit()

    if (!isLogAllowed) return

    const timestamp = getTimestamp()

    const message = safeMessage(rawMessage)
    const url = req?.originalUrl ? safeUrl(req.originalUrl) : ''


    if (checkLoggerExist()) {
        config.customLogger.warn(`[${timestamp}] - ${req?.method || ''} ${url} \n[WARNING]: ${message}`)
    } else {
            if (config.customLogger) console.warn(`[Logger is connected but not contain 'warn']`)
        console.warn(`\x1b[33m[${timestamp}] - ${req?.method || ''} ${url} \n[WARNING]: ${message}\x1b[0m`)
    }
}

function logDebug(rawMessage, req) {

    const isLogAllowed = checkRateLimit()

    if (!isLogAllowed) return

    const timestamp = getTimestamp()

    const message = safeMessage(rawMessage)
    const url = req?.originalUrl ? safeUrl(req.originalUrl) : ''

    if (checkLoggerExist()) {
        config.customLogger.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${url} [Message]: ${message}`)
    } else {
        if (config.customLogger) console.warn(`[Logger is connected but not contain 'debug']`)
        console.debug(`\x1b[34m[${timestamp}] - [DEBUG]: ${req?.method || ''} ${url} [Message]: ${message}\x1b[0m`)
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

const checkRateLimit = () => {
    const now = performance.now()

    const WINDOW_SIZE_IN_MS = 60 * 1000;
    const MAX_REQUESTS = 5;

    if (!rateLimiters) {
        rateLimiters = {
            count: 1,
            startTime: now,
            hasWarned: false,
        }
        return true
    }

    const elapsed = now - rateLimiters.startTime

    if (elapsed < WINDOW_SIZE_IN_MS) {
        if (rateLimiters.count >= MAX_REQUESTS) {
            if (!rateLimiters.hasWarned) {
                rateLimiters.hasWarned = true
                console.log('\x1b[33m [WARNING]: TOO MANY logs REQUESTS \x1b[0m')
                return false
            }
            return false
        } else if (rateLimiters.count < MAX_REQUESTS) {
            rateLimiters.count++
            return true
        }
        
    } else {
        rateLimiters.count = 1
        rateLimiters.startTime = now
        rateLimiters.hasWarned = false
        return true
    }

    return true

}

module.exports = {
    logError,
    logInfo,
    logWarning,
    logDebug
}