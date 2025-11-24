const AppError = require("../errors/AppError");

function BadRequest(message = "Bad Request") {
    return new AppError(message, 400, true);
}

function Unauthorized(message = "Unauthorized") {
    return new AppError(message, 401, true);
}

function PaymentRequired(message = "Payment Required") {
    return new AppError(message, 402, true);
}

function Forbidden(message = "Forbidden") {
    return new AppError(message, 403, true);
}

function NotFound(message = "Not Found") {
    return new AppError(message, 404, true);
}


function InternalServerError(message = "Internal Server Error", isOperational = false) {
    return new AppError(message, 500, isOperational);
}

function NotImplemented(message = "Not Implemented") {
    return new AppError(message, 501, true);
}

function BadGateway(message = "Bad Gateway") {
    return new AppError(message, 502, true);
}

function ServiceUnavailable(message = "Service Unavailable") {
    return new AppError(message, 503, true);
}


const mapErrorNameToPreset = (name, message) => {
    const presetError = presetErrors[name]
    if (presetError) {
        return presetError(message)
    } else {
        return InternalServerError(message)
    }
}

const presetErrors = {
    'BadRequest': BadRequest,
    'ValidationError': BadRequest,
    'SyntaxError': BadRequest,
    'CastError': BadRequest,
    'DuplicateKeyError': BadRequest,
    'Unauthorized': Unauthorized,
    'PaymentRequired': PaymentRequired,
    'Forbidden': Forbidden,
    'NotFound': NotFound,
    'InternalServerError': InternalServerError,
    'NotImplemented': NotImplemented,
    'BadGateway': BadGateway,
    'ServiceUnavailable': ServiceUnavailable    
}

module.exports = {
    BadRequest,
    Unauthorized,
    PaymentRequired,
    Forbidden,
    NotFound,
    InternalServerError,
    NotImplemented,
    BadGateway,
    ServiceUnavailable,
    mapErrorNameToPreset
};