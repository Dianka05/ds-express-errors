const HttpStatus = require("../constants/httpStatus")
const AppError = require("../errors/AppError")

function BadRequest(message = "Bad Request") {
    return new AppError(message, HttpStatus.BAD_REQUEST, true)
}
function Unauthorized(message = "Unauthorized") {
    return new AppError(message, HttpStatus.UNAUTHORIZED, true)
}

function PaymentRequired(message = "Payment Required") {
    return new AppError(message, HttpStatus.PAYMENT_REQUIRED, true)
}

function Forbidden(message = "Forbidden") {
    return new AppError(message, HttpStatus.FORBIDDEN, true)
}

function NotFound(message = "Not Found") {
    return new AppError(message, HttpStatus.NOT_FOUND, true)
}

function Conflict(message = "Conflict") {
    return new AppError(message, HttpStatus.CONFLICT, true)
}
// nww
function UnprocessableContent(message = "Unprocessable Content") {
    return new AppError(message, HttpStatus.UNPROCESSABLE_CONTENT, true)
}

function TooManyRequests(message = "Too Many Requests") {
    return new AppError(message, HttpStatus.TOO_MANY_REQUESTS, true)
}

function InternalServerError(message = "Internal Server Error", isOperational = false) {
    return new AppError(message, HttpStatus.INTERNAL_SERVER_ERROR, isOperational)
}

function NotImplemented(message = "Not Implemented") {
    return new AppError(message, HttpStatus.NOT_IMPLEMENTED, true)
}

function BadGateway(message = "Bad Gateway") {
    return new AppError(message, HttpStatus.BAD_GATEWAY, true)
}

function ServiceUnavailable(message = "Service Unavailable") {
    return new AppError(message, HttpStatus.SERVICE_UNAVAILABLE, true)
}

const presetErrors = {
    // 400
    'BadRequest': BadRequest,
    'ValidationError': BadRequest,
    'CastError': BadRequest, // Mongoose
    'DuplicateKeyError': BadRequest, // Mongoose (legacy name usage)
    'SequelizeUniqueConstraintError': BadRequest, 
    'SequelizeValidationError': BadRequest,
    'SequelizeForeignKeyConstraintError': BadRequest,
    'PrismaClientKnownRequestError': BadRequest,
    'PrismaClientUnknownRequestError': BadRequest,
    'PrismaClientRustPanicError': BadRequest,
    'PrismaClientInitializationError': BadRequest,
    'PrismaClientValidationError': BadRequest,
    
    // 401
    'JsonWebTokenError': Unauthorized,
    'TokenExpiredError': Unauthorized,
    'NotBeforeError': Unauthorized,
    'UnauthorizedError': Unauthorized, // express-jwt
    'Unauthorized': Unauthorized,

    // 402
    'PaymentRequired': PaymentRequired,
    
    // 403
    'Forbidden': Forbidden,
    'ForbiddenError': Forbidden,

    // 404
    'NotFound': NotFound,
    'NotFoundError': NotFound,
    
    // 409 (uused)
    'Conflict': Conflict,
    'ConflictError': Conflict,
    
    // 429
    'TooManyRequests': TooManyRequests,
    'TooManyRequestsError': TooManyRequests,
    'RateLimitError': TooManyRequests,
    
    // 500
    'MongoServerError': InternalServerError,

    // 501
    'NotImplemented': NotImplemented,

    // 502
    'BadGateway': BadGateway,

    // 503
    'ServiceUnavailable': ServiceUnavailable    
}

module.exports = {
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
    presetErrors
}