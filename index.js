const { setConfig } = require("./src/config/config")
const AppError = require("./src/errors/AppError")
const { logError, logInfo, logWarning } = require("./src/logger/logger")
const { asyncHandler } = require("./src/middleware/asyncHandler")
const { errorHandler, initGlobalHandlers } = require("./src/middleware/errorHandler")
const { NotFound, Unauthorized, BadRequest, Conflict, TooManyRequests, InternalServerError, Forbidden, PaymentRequired, NotImplemented, BadGateway, ServiceUnavailable } = require("./src/presets/presets")

const Errors = {
    BadRequest,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
    Conflict,
    TooManyRequests,
    InternalServerError,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
}

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    initGlobalHandlers,
    logError,
    logInfo,
    logWarning,
    Errors,
    setConfig
}