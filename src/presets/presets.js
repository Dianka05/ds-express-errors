const { config } = require("../config/config")
const { checkIsDev } = require("../config/config")
const HttpStatus = require("../constants/httpStatus")
const AppError = require("../errors/AppError")
const { logDebug, logWarning } = require("../logger/logger")
const { safeStringify } = require("../utils/safeStringify")

const isDebug = process.env.DEBUG === "true"

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
    
    // 409 (NEW)
    'Conflict': Conflict,
    'ConflictError': Conflict,
    
    // 429 (NEW)
    'TooManyRequests': TooManyRequests,
    'TooManyRequestsError': TooManyRequests,
    'RateLimitError': TooManyRequests,
    
    // 500
    'InternalServerError': InternalServerError,
    'ReferenceError': InternalServerError,
    'TypeError': InternalServerError,
    'RangeError': InternalServerError,
    'MongoServerError': InternalServerError,

    // 501
    'NotImplemented': NotImplemented,

    // 502
    'BadGateway': BadGateway,

    // 503
    'ServiceUnavailable': ServiceUnavailable    
}

const mapErrorNameToPreset = (err, req) => {

    const isDevEnvironment = checkIsDev()

    if (config.customMappers && config.customMappers.length > 0) {
        for (const mapper of config.customMappers) {
            const mapperFunc = mapper(err, req);
            if (mapperFunc) return mapperFunc
        }
    }

    if (!err || typeof err !== 'object') {
        logWarning(`Non-object error received in mapErrorNameToPreset: ${safeStringify(err)}`, req)
        return InternalServerError(isDevEnvironment ? `Non-object error received: ${safeStringify(err)}` : "An unexpected error occurred.")
    }

    const { name, code, message } = err

    if (Array.isArray(err.issues) && err.issues[0]?.path) { //ZOD
        const formattedMessages = err.issues.map(issue => {
            const path = issue.path.join('.')
            return `${path ? path + ': '  : ''}${issue.message}`
        }).join('; ')

        isDebug && logDebug(`Zod validation error issues: ${formattedMessages}`, req)

        return BadRequest(`Validation error: ${formattedMessages}`)
    }

    if (err.isJoi === true && Array.isArray(err.details)) { //JOI
        const formattedMessage = err.details
            .map(detail => detail.message.replace(/"/g, ''))
            .join('; ')
            
        isDebug && logDebug(`Joi validation error details: ${formattedMessage}`, req)

        return BadRequest(`Validation Error: ${formattedMessage}`);
    }

    if (code && String(code).startsWith("11")) { //MONGOOSE
        return BadRequest(`Duplicate field value entered: ${safeStringify(err.keyValue).replace(/"/g, '')}`)
    } else if (name === 'ValidationError' && err.errors) {
        const {errors} = err
        const formattedMessage = Object.values(errors)
            .map(e => {
                return `${e.message} = [Value]: "${e.value}"`
            }).join('; ')
        return BadRequest(`${formattedMessage}`)
    }

    const isPrisma = err.clientVersion && typeof err.clientVersion === 'string'

    if(isPrisma) {
        const {target, field_name } = err.meta || {}
        
        let formattedDetail;

        if (Array.isArray(target)) formattedDetail = `Target: [${target.join('; ')}]`
        
        else if (typeof field_name === 'string') formattedDetail = `Field Name: ${field_name}`

        else formattedDetail = "Unknown Prisma error detail";

        const hasCode = err.code ? `[${err.code}]: ` : '' 
        const formattedMessage = `${hasCode}${formattedDetail}; [MESSAGE] ${err.message}`

        isDebug && logDebug(`Prisma error: ${formattedMessage}`, req)

        return BadRequest(formattedMessage);
    }

    const isSequelizeValidationError = name === 'SequelizeValidationError' && Array.isArray(err.errors)
    const isSequelizeForeignKeyError = name === 'SequelizeForeignKeyConstraintError' && Array.isArray(err.fields)

    if (isSequelizeValidationError) {
        const formattedMessage = err.errors
            .map(error => error.message)
            .join('; ')
            
        isDebug && logDebug(`Sequelize validation error: ${formattedMessage}`, req)

        return BadRequest(`${name}: ${formattedMessage}`);
    } else if (isSequelizeForeignKeyError) {
         const formattedMessage = `Fields: "${err.fields.join('; ')}"; ${message}`
            
        isDebug && logDebug(`Sequelize foreign key error: ${formattedMessage}`, req)

        return BadRequest(`${name}: ${formattedMessage}`);
    }

    if (name === 'SyntaxError') {
        const isBadRequestCode = err.status === HttpStatus.BAD_REQUEST || err.statusCode === HttpStatus.BAD_REQUEST
        const isJsonError = message.includes('JSON')
        if (isBadRequestCode || isJsonError) {
            return BadRequest(isDevEnvironment ? message : "Invalid JSON format")        
        }
    }

    const presetError = presetErrors[name]

    if (presetError) {
        return presetError(`${name}: ${message}`)
    }
    if (isDevEnvironment || isDebug) {
        logDebug(`[Unknown error mapping]: => Name: ${name}, | Code: ${code}, | Message: ${message}`, req)
    }
    
    return InternalServerError(isDevEnvironment ? message : "An unexpected error occurred.")
}

module.exports = {
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
    mapErrorNameToPreset
}