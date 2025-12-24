const { config, checkIsDev } = require('../config/config')
const HttpStatus = require('../constants/httpStatus')
const AppError = require('../errors/AppError')
const { logError, logWarning } = require('../logger/logger')
const { mapErrorNameToPreset } = require('../presets/errorMapper')
const { safeStringify } = require('../utils/safeStringify')

function errorHandler(err, req, res, next) {
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
    res.status(err.statusCode).json(resBody)
}

const gracefulHttpClose = (server) => {
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
        console.warn('Force closing server')
        done()
      }

      signal?.addEventListener('abort', forceClose)

      server.close(done)
    })
}


function initGlobalHandlers(options = {}) {

    const { 
        exitOnUnhandledRejection = true, 
        exitOnUncaughtException = true, 
        onCrash, 
        onShutdown,
        closeServer 
    } = options

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

    const timeout = async (cleanupFn, ms = 10) => {
        const controller = new AbortController()
        const { signal } = controller
        let finished = false

        try {
            await Promise.race([
                cleanupFn(signal).then(() => finished = true),
                new Promise((_, reject) => 
                    setTimeout(() => {
                        controller.abort()
                        reject(new Error('Shutdown timed out (10s limit)'))
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

    process.on('uncaughtException', (error) => {
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

}

module.exports = {errorHandler, initGlobalHandlers, gracefulHttpClose}