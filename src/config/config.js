let config = {
    customMappers: [],
    devEnvironments: ['dev', 'development'],
    formatError: (err, {req, isDev}) => ({ 
        status: err.isOperational ? 'fail' : 'error',
        method: req.method,
        url: req.originalUrl,
        message: err.message,
        ...(isDev ? { stack: err.stack } : {})
    })
}
const setConfig = (newOptions) => {
    Object.assign(config, newOptions)
}

const checkIsDev = () => {
    return config.devEnvironments.includes(process.env.NODE_ENV);
}

module.exports = {config, setConfig, checkIsDev}