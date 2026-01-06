const ConfigError = require("../errors/internal/ConfigError")

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
    if (!newOptions || typeof newOptions !== 'object' || Array.isArray(newOptions)) {
        throw new ConfigError('setConfig expected an object', setConfig)
    } else if (newOptions && Object.keys(newOptions).length === 0) {
        throw new ConfigError('setConfig should not be null if inicializated', setConfig)
    }

    if (newOptions.customMappers && !Array.isArray(newOptions.customMappers)) {
        throw new ConfigError('customMappers must be an array', setConfig)
    }

    if (newOptions.devEnvironments && !Array.isArray(newOptions.devEnvironments)) {
        throw new ConfigError('devEnvironments must be an array', setConfig)
    }

    if (newOptions.formatError && 
        typeof newOptions.formatError !== 'function' 
        || newOptions.formatError === null 
        || 'formatError' in newOptions && newOptions.formatError === undefined) 
    {
        throw new ConfigError('formatError must be an function', setConfig)
    }

    if (newOptions.logger && Array.isArray(newOptions.logger)) {
        throw new ConfigError('logger must be an object', setConfig)
    } else if (newOptions.logger && Object.keys(newOptions.logger).length === 0) {
        throw new ConfigError('logger should not be null or empty if inicializated', setConfig)
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