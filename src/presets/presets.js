const AppError = require("../errors/AppError");
const { logWarning } = require("../logger/logger");
const { logDebug } = require("../logger/logger");

const isDebug = process.env.DEBUG === "true";
const isDev = process.env.NODE_ENV === 'development'



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


const mapErrorNameToPreset = (err, req) => {

    if (!err || typeof err !== 'object') {
        logWarning(`Non-object error received in mapErrorNameToPreset: ${JSON.stringify(err)}`, req);
        return InternalServerError(isDev ? `Non-object error received: ${JSON.stringify(err)}` : "An unexpected error occurred.");
    }

    const { name, code, message } = err;

    if (code && String(code).startsWith("11")) {
        return BadRequest(`Duplicate field value entered: ${JSON.stringify(err.keyValue)}`)
    } 
    const presetError = presetErrors[name]

    if (presetError) {
        return presetError(message)
    }
    if (isDev || isDebug) {
        logDebug(`Unknown error mapping: | name: ${name}, | code: ${code}, | message: ${message}, | stack: ${err.stack}`);
    }
    
    return InternalServerError(isDev ? message : "An unexpected error occurred.");
}

const presetErrors = {
    'BadRequest': BadRequest,
    'ValidationError': BadRequest,
    'SyntaxError': BadRequest,
    'ReferenceError': InternalServerError,
    'TypeError': InternalServerError,
    'RangeError': InternalServerError,
    'UnauthorizedError': Unauthorized,
    'ForbiddenError': Forbidden,
    'CastError': BadRequest,
    'DuplicateKeyError': BadRequest,
    'SequelizeUniqueConstraintError': BadRequest,
    'SequelizeValidationError': BadRequest,
    'PrismaClientKnownRequestError': BadRequest,
    'PrismaClientUnknownRequestError': BadRequest,
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