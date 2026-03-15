const {ConfigAlreadySet, ConfigInvalid, ConfigSettingMissing } = require("../errors/internal/ConfigError")

let config = {
    customMappers: [],
    customLogger: null,
    errorClasses: null,
    needMappers: null,
    maxLoggerRequests: 100,
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

let isSetConfigCalled = false

function resetSetConfigCalled () {
    isSetConfigCalled = false
}

const setConfig = (newOptions) => {
    if (isSetConfigCalled) {
        throw new ConfigAlreadySet('setConfig should be called only once', setConfig)
    }

    if (!newOptions || typeof newOptions !== 'object' || Array.isArray(newOptions)) {
        throw new ConfigInvalid('setConfig expected an object', setConfig)
    } else if (newOptions && Object.keys(newOptions).length === 0) {
        throw new ConfigSettingMissing('setConfig should not be null if initialized', setConfig)
    }

    if (newOptions.customMappers && !Array.isArray(newOptions.customMappers)) {
        throw new ConfigInvalid('customMappers must be an array', setConfig)
    } else if ( 
        newOptions.customMappers &&
        newOptions.customMappers.some(fn => typeof fn !== 'function' || fn.constructor.name === 'AsyncFunction')
    ) {
        throw new ConfigInvalid('customMappers must contain only sync functions', setConfig)
    }

    if (newOptions.devEnvironments && !Array.isArray(newOptions.devEnvironments)) {
        throw new ConfigInvalid('devEnvironments must be an array', setConfig)
    }

    if (newOptions.needMappers && !Array.isArray(newOptions.needMappers)) {
        throw new ConfigInvalid('needMappers must be an array', setConfig)
    }

    if (
        newOptions.errorClasses &&
        (
            typeof newOptions.errorClasses !== 'object' ||
            Array.isArray(newOptions.errorClasses) ||
            newOptions.errorClasses === null
        )
    ) {
        throw new ConfigInvalid('errorClasses must be an object', setConfig)
    }

    if ('formatError' in newOptions && typeof newOptions.formatError !== 'function') 
    {
        throw new ConfigInvalid('formatError must be an function', setConfig)
    }

    if (newOptions.customLogger &&
        (typeof newOptions.customLogger !== 'object' || Array.isArray(newOptions.customLogger))
    ) {
        throw new ConfigInvalid('customLogger must be an object', setConfig)
    } else if (newOptions.customLogger && Object.keys(newOptions.customLogger).length === 0) {
        throw new ConfigSettingMissing('customLogger should not be null or empty if initialized', setConfig)
    }

    Object.assign(config, newOptions)
    isSetConfigCalled = true
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
    if (typeof process === 'undefined' || !process.env) return false
    return config.devEnvironments.includes(process.env.NODE_ENV);
}

const checkIsDebug = () => {
    if (typeof process === 'undefined' || !process.env) return false
    return process.env.DEBUG === "true"
}

module.exports = { config, setConfig, checkIsDev, checkIsDebug, checkLoggerExist, resetSetConfigCalled }