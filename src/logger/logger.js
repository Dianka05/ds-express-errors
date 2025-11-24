const isDev = process.env.NODE_ENV === 'development'

function logError(error, req) {
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = error.message || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = isDev ? error.stack : undefined
        console.error(`[${timestamp}] ${req?.method || ''} ${req?.originalUrl || ''} \nError: ${error.name} \nMessage: ${message} \nStatusCode: ${statusCode} \nStack: ${stack} \nOperational: ${isOperational}\n`)
    }

}

function logInfo(message) {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] - INFO: ${message}`)
}

function logWarning(message, req) {
    const timestamp = getTimestamp()
    console.warn(`[${timestamp}] - ${req?.method} ${req?.originalUrl} \nWARNING: ${message}`)
}

function logDebug(message) {
    const timestamp = getTimestamp()
    console.debug(`[${timestamp}] - DEBUG: ${message}`)
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