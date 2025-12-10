let config = {
    customMappers: [],
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
    Object.assign(config, newOptions)
}

const checkIsDev = () => {
    return config.devEnvironments.includes(process.env.NODE_ENV);
}

const checkIsDebug = () => {
    return process.env.DEBUG === "true"
}

module.exports = {config, setConfig, checkIsDev, checkIsDebug}