const AppError = require("../errors/AppError");

function BadRequest(message = "Bad Request") {
    return new AppError(message, 400, true);
}

function NotFound(message = "Not Found") {
    return new AppError(message, 404, true);
}

function Unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, true);
}

function Forbidden(message = "Forbidden") {
    return new AppError(message, 403, true);
}

function InternalServerError(message = "Internal Server Error", isOperational = false) {
    return new AppError(message, 500, isOperational);
}

module.exports = {
    BadRequest,
    NotFound,
    Unauthorized,
    Forbidden,
    InternalServerError
};