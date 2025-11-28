const AppError = require("./src/errors/AppError");
const { logError, logInfo, logWarning } = require("./src/logger/logger");
const { asyncHandler } = require("./src/middleware/asyncHandler");
const { errorHandler } = require("./src/middleware/errorHandler");
const { NotFound, Unauthorized, BadRequest, InternalServerError, Forbidden, PaymentRequired, NotImplemented, BadGateway, ServiceUnavailable } = require("./src/presets/presets");

const Errors = {
    BadRequest,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
    InternalServerError,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
}

module.exports = {
    AppError,
    errorHandler,
    asyncHandler,
    logError,
    logInfo,
    logWarning,
    Errors
};