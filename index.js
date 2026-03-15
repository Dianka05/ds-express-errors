const { setConfig } = require("./src/config/config")
const AppError = require("./src/errors/AppError")
const { logError, logInfo, logWarning, logDebug } = require("./src/logger/logger")
const { asyncHandler } = require("./src/middleware/asyncHandler")
const { errorHandler, initGlobalHandlers, gracefulHttpClose } = require("./src/middleware/errorHandler")
const { NotFound, Unauthorized, BadRequest, Conflict, TooManyRequests, InternalServerError, Forbidden, PaymentRequired, NotImplemented, BadGateway, ServiceUnavailable, UnprocessableContent, GatewayTimeout } = require("./src/presets/presets")

const Errors = {
    BadRequest,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
    Conflict,
    UnprocessableContent,
    TooManyRequests,
    InternalServerError,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
    GatewayTimeout
}

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    initGlobalHandlers,
    gracefulHttpClose,
    logError,
    logInfo,
    logDebug,
    logWarning,
    Errors,
    setConfig
}