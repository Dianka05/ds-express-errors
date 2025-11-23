function logError(error) {
    const timestamp = getTimestamp()
    if (error) {
        const isOperational = error.isOperational || false
        const message = error.message || 'Unknown error'
        const statusCode = error.statusCode || 'N/A'
        const stack = error.stack || 'N/A'

        console.error(`[${timestamp}] \nError: \nMessage: ${message} \nStatusCode: ${statusCode} \nStack: ${stack} \nOperational: ${isOperational}\n`)
    }

}

function logInfo(message) {
    const timestamp = getTimestamp()
    console.log(`[${timestamp}] - INFO: ${message}`)
}

function logWarning(message) {
    const timestamp = getTimestamp()
    console.warn(`[${timestamp}] - WARNING: ${message}`)
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