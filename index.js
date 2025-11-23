const AppError = require("./src/errors/AppError");
const { logError, logInfo, logWarning } = require("./src/logger/logger");
const { errorHandler } = require("./src/middleware/errorHandler");
const { NotFound, Unauthorized, BadRequest, InternalServerError, Forbidden } = require("./src/presets/presets");

const Errors = {
    NotFound,
    Unauthorized,
    BadRequest,
    Forbidden,
    InternalServerError,
}

module.exports = {
    AppError,
    errorHandler,
    logError,
    logInfo,
    logWarning,
    Errors
};