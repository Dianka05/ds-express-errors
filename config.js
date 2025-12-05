let config = {
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

module.exports = {config, setConfig}