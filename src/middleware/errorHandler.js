const { config, checkIsDev } = require('../config/config')
const AppError = require('../errors/AppError')
const { GlobalHandlerAlreadySet, GlobalHandlerInvalid } = require('../errors/internal/GlobalHandlerError')
const { logError, logWarning } = require('../logger/logger')
const { mapErrorNameToPreset } = require('../presets/errorMapper')
const isAsync = require('../utils/isAsync')


function errorHandler(err, req, res, next) {

    if (res.headerSent) {
        return next(err)
    }

    if (err instanceof AppError) {
        defaultErrorAnswer(err, req, res)
    } else {
        const genericError = mapErrorNameToPreset(err, req)
        defaultErrorAnswer(genericError, req, res)
    }
}

function defaultErrorAnswer(err, req, res) {
    logError(err, req)
    const isDev = checkIsDev()
    const options = {req, isDev}
    const resBody = config.formatError(err, options)
    const status = err.statusCode || 500
    res.status(status).json(resBody)
}

const gracefulHttpClose = (server) => {

    const isServerObject = server && 
        typeof server.listen === 'function' && 
        typeof server.close === 'function' &&
        typeof server.address === 'function'
    ;

    if (!isServerObject) {
        throw new GlobalHandlerInvalid('\x1b[31mPlease provide a valid \x1b[41m\x1b[1mserver\x1b[0m\x1b[0m\x1b[31m object to\x1b[0m\x1b[34m gracefulHttpClose()\x1b[0m', gracefulHttpClose)
    }

  return (signal) =>
    new Promise((resolve, reject) => {
      let finished = false

      const done = (err) => {
        if (finished) return
        finished = true

        signal?.removeEventListener('abort', forceClose)
        err ? reject(err) : resolve()
      }

      const forceClose = () => {
        logWarning('Force closing server')
        done()
      }

      signal?.addEventListener('abort', forceClose)

      server.close(done)
    })
}

let isGlobalHandlerInitialized = false

function resetGlobalHandlerInitialized() {
    isGlobalHandlerInitialized = false
}

function initGlobalHandlers(options = {}) {

    const { 
        exitOnUnhandledRejection = true, 
        exitOnUncaughtException = true, 
        onCrash, 
        onShutdown,
        closeServer,
        maxTimeout = 10000
    } = options

    if (isGlobalHandlerInitialized) {
        throw new GlobalHandlerAlreadySet('Global handlers should be initialized only once', initGlobalHandlers)
    } 

    if (onCrash && !isAsync(onCrash)) {
        throw new GlobalHandlerInvalid('onCrash should be an async function', initGlobalHandlers)
    }

    if (onShutdown && !isAsync(onShutdown)) {
        throw new GlobalHandlerInvalid('onShutdown should be an async function', initGlobalHandlers)
    }

    if (closeServer && typeof closeServer !== 'function') {
        throw new GlobalHandlerInvalid('\x1b[31m closeServer should be a function -\x1b[0m\x1b[34m use gracefulHttpClose() \x1b[0m', initGlobalHandlers)
    }

    let shuttingDown = false

    const safeShutdown = async (fn, code = 0) => {
        if (shuttingDown) {
            logWarning('Forced exit from graceful shutdown')
            process.exit(1)
        }
        shuttingDown = true
        try {
            await fn()
            process.exit(code)
        } catch (e) {
            logError(e)
            process.exit(1)
        }
    }

    const timeout = async (cleanupFn, ms = maxTimeout) => {
        const controller = new AbortController()
        const { signal } = controller
        let finished = false

        try {
            await Promise.race([
                Promise.resolve(cleanupFn(signal)).then(() => {
                    finished = true
                }),                
                new Promise((_, reject) => 
                    setTimeout(() => {
                        controller.abort()
                        reject(new Error('Shutdown timed out'))
                    }, ms)
                )
            ]);
        } catch(err) {
            logError(err)
            throw err
        }
        finally {
            if (!finished) {
                controller.abort()
            }
        }
    }

    const handleCrash = async (error) => {
        if (onCrash && typeof onCrash === 'function') {
            try {
                await timeout((signal) => onCrash(error, signal))

            } catch (err) {
                logError(err);
            }
        }
    }

    const handleServerClose = async () => {
        await handleFn(closeServer)
    }

    const handleFn = async (fn) => {
        if (fn && typeof fn === 'function') {
            await timeout(fn)
        }
    }

    const handleShutdown = async () => {
        await handleFn(onShutdown)
    }

    process.on('unhandledRejection', (reason) => {
        logError(reason)
        if (exitOnUnhandledRejection) {
            safeShutdown(() => handleCrash(reason), 1)        
        }
    })

    process.on('uncaughtException', (error, origin) => {
        logError(error)
        if (exitOnUncaughtException) {
            safeShutdown(() => handleCrash(error), 1)
        }
    })

    const handleNormalShutdown = async () => {
        await Promise.all([handleServerClose(), handleShutdown()])
    }

    process.on('SIGINT', () => safeShutdown(handleNormalShutdown))
    process.on('SIGTERM', () => safeShutdown(handleNormalShutdown))
    process.on('SIGQUIT', () => safeShutdown(handleNormalShutdown))

    isGlobalHandlerInitialized = true

}

module.exports = {errorHandler, initGlobalHandlers, gracefulHttpClose, resetGlobalHandlerInitialized}