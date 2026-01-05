const { logWarning } = require("../logger/logger")

let config = {
    customMappers: [],
    customLogger: null,
    devEnvironments: ['dev', 'development'],
    formatError: (err, {req, isDev}) => ({ 
        status: err.isOperational ? 'fail' : 'error',
        message: err.message,
        ...(isDev ? { 
            method: req.method,
            url: req.originalUrl,
            stack: err.stack
         } : {})
    })
}
const setConfig = (newOptions) => {
    if (!newOptions || typeof newOptions !== 'object') {
        logWarning('setConfig expected an object')
    }

    if (newOptions.customMappers || !Array.isArray(newOptions.customMappers)) {
        logWarning('customMappers must be an array')
    }


    if (newOptions.devEnvironments || !Array.isArray(newOptions.devEnvironments)) {
        logWarning('devEnvironments must be an array')
    }

    Object.assign(config, newOptions)
}

const checkLoggerExist = () => {
    if (config.customLogger === null) return false
    const supportedLoggerLevels = [
        'error',
        'warn',
        'info',
        'debug'
    ]

    for (const loggerType of supportedLoggerLevels) {
        if (!(loggerType in config.customLogger) || typeof config.customLogger[loggerType] !== 'function') {
            return false
        }
    }
    return true
}

const checkIsDev = () => {
    return config.devEnvironments.includes(process.env.NODE_ENV);
}

const checkIsDebug = () => {
    return process.env.DEBUG === "true"
}

module.exports = {config, setConfig, checkIsDev, checkIsDebug, checkLoggerExist}