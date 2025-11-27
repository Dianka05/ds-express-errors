const isDev = process.env.NODE_ENV === 'development'

function logError(error, req) {
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = error.message || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = isDev ? error.stack : undefined
        const code = error.code ? `[${error.code}]` : ''
        const name = error.name || ''

        console.error(`[${timestamp}] ${req?.method || ''} ${req?.originalUrl || ''} \n[Error]: ${code} ${name} \nMessage: ${message} \nStatusCode: ${statusCode} \n${stack ? `Stack: ${stack}` : ''} \nOperational: ${isOperational}\n`)
    }
}

function logInfo(message) {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] - [INFO]: ${message}`)
}

function logWarning(message, req) {
    const timestamp = getTimestamp()
    console.warn(`[${timestamp}] - ${req?.method || ''} ${req?.originalUrl || ''} \n[WARNING]: ${message}`)
}

function logDebug(message, req) {
    const timestamp = getTimestamp()
    console.debug(`[${timestamp}] - [DEBUG]: ${req?.method || ''} ${req?.originalUrl || ''} [Message]: ${message}`)
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