const { getConfig } = require("../../config/config")
const { checkIsDev, checkIsDebug } = require("../../config/config")
const { logDebug } = require("../../logger/logger")
const { safeStringify } = require("../../utils/safeStringify")
const { GatewayTimeout } = require("../presets")
const { BadRequest, Conflict, NotFound, InternalServerError, ServiceUnavailable } = require("../presets")

const sequelizeMapper = (err, req) => {
    const sequelizeClass = getConfig()?.errorClasses?.Sequelize;
    if (sequelizeClass) {
        return sendResponseForMappedError(sequelizeClass, err, req)
    }
    const isDevEnvironment = checkIsDev()

    // If config errorClasses NOT defined
    const { name, message } = err

    if (!name?.startsWith('Sequelize')) {
        return null;
    }

    //400
    const isSequelizeValidationError = name === 'SequelizeValidationError' && Array.isArray(err.errors)

    //409
    const isSequelizeForeignKeyError = name === 'SequelizeForeignKeyConstraintError'

    //409
    const isSequelizeUniqueConstraintError = name === 'SequelizeUniqueConstraintError' && Array.isArray(err.errors)

    //409
    const isSequelizeOptimisticLockError = name === 'SequelizeOptimisticLockError' && err?.modelName && err?.values

    //404
    const isSequelizeEmptyResultError = name === 'SequelizeEmptyResultError'
    //500
    const isSequelizeDatabaseError = name === 'SequelizeDatabaseError' && err?.parent?.code
    //503
    const isSequelizeConnectionError = name === 'SequelizeConnectionError'
    //504
    const isSequelizeTimeoutError = name === 'SequelizeTimeoutError'

    if (isSequelizeOptimisticLockError) {
        const formattedMessage = `Model: ${err.modelName}; Values: ${safeStringify(err.values)}; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize optimistic lock error: ${formattedMessage}`, req)

        return Conflict(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Resource conflict occurred'}`);
    } else if (isSequelizeEmptyResultError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize empty results error: ${formattedMessage}`, req)

        return NotFound(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Resource not found'}`);
    } else if (isSequelizeUniqueConstraintError) {
        const formattedMessage = err.errors
            .map(error => error.message)
            .join('; ')
            
        checkIsDebug() && logDebug(`Sequelize error: ${formattedMessage}`, req)

        return Conflict(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Resource already exists'}`);
    } else if (isSequelizeForeignKeyError) {
        const fields = Array.isArray(err?.fields) 
            ? err?.fields?.join('; ')
            : safeStringify(err?.fields)

         const formattedMessage = `Fields: "${fields}"; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize foreign key error: ${formattedMessage}`, req)

        return Conflict(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'invalid references'}`);
    } else if (isSequelizeValidationError ) {
        const formattedMessage = err.errors
            .map(error => error.message)
            .join('; ')
            
        checkIsDebug() && logDebug(`Sequelize validation error: ${formattedMessage}`, req)

        return BadRequest(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'validation error'}`);
    } else if (isSequelizeDatabaseError) {
        const formattedMessage = `SQL: ${err.sql}; Parent Code: ${err.parent.code}; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize database error: ${formattedMessage}`, req)

        return InternalServerError(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database error occurred'}`);
    } else if (isSequelizeTimeoutError) {
        const formattedMessage = message
        checkIsDebug() && logDebug(`Sequelize timeout error: ${formattedMessage}`, req)

        return GatewayTimeout(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database timeout error occurred'}`);
    } else if (isSequelizeConnectionError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database connection error occurred'}`);
    }
}


// If config errorClasses defined
const sendResponseForMappedError = (sequelize, err, req) => {
    const isDevEnvironment = checkIsDev()

    const { message } = err

    // 409
    if (err instanceof sequelize.ForeignKeyConstraintError) {
        const fields = Array.isArray(err?.fields) 
            ? err?.fields?.join('; ')
            : safeStringify(err?.fields)

        const formattedMessage = `Fields: "${fields}"; ${message}`

        checkIsDebug() && logDebug(`Sequelize foreign key error: ${formattedMessage}`, req)

        return Conflict(`Sequelize: [ForeignKeyConstraintError] ${isDevEnvironment ? formattedMessage : 'invalid references'}`);
    }
    else if (err instanceof sequelize.UniqueConstraintError) {
        const formattedMessage = err.errors
            .map(error => error.message)
            .join('; ')

        checkIsDebug() && logDebug(`Sequelize: ${formattedMessage}`, req)

        return Conflict(`Sequelize: [UniqueConstraintError]: ${isDevEnvironment ? formattedMessage : 'Resource already exists'}`);
    }
    else if (err instanceof sequelize.OptimisticLockError) {
        const formattedMessage = `Model: ${err.modelName}; Values: ${safeStringify(err.values)}; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize optimistic lock error: ${formattedMessage}`, req)

        return Conflict(`Sequelize: [OptimisticLockError] ${isDevEnvironment ? formattedMessage : 'Resource conflict occurred'}`);
    }
    // 404
    else if (err instanceof sequelize.EmptyResultError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize empty results error: ${formattedMessage}`, req)

        return NotFound(`Sequelize: [EmptyResultError] ${isDevEnvironment ? formattedMessage : 'Resource not found'}`);
    }
    // 504
    else if (err instanceof sequelize.TimeoutError ) {
        const formattedMessage = message
        checkIsDebug() && logDebug(`Sequelize timeout error: ${formattedMessage}`, req)

        return GatewayTimeout(`Sequelize: [TimeoutError] ${isDevEnvironment ? formattedMessage : 'Database timeout error occurred'}`);
    }
    else if (err instanceof sequelize.ConnectionTimedOutError) {
        const formattedMessage = message
        checkIsDebug() && logDebug(`Sequelize timeout error: ${formattedMessage}`, req)

        return GatewayTimeout(`Sequelize: [ConnectionTimedOutError] ${isDevEnvironment ? formattedMessage : 'Database timeout error occurred'}`);
    }
     // 500
    else if (err instanceof sequelize.DatabaseError) {
        const formattedMessage =
            `SQL: ${err.sql ?? 'unknown'}; ` +
            `Parent Code: ${err.parent?.code ?? 'unknown'}; ` +
            message;            
        checkIsDebug() && logDebug(`Sequelize database error: ${formattedMessage}`, req)

        return InternalServerError(`Sequelize: [DatabaseError] ${isDevEnvironment ? formattedMessage : 'Database error occurred'}`);
    }
    // 400
     else if (err instanceof sequelize.ValidationError) {
        const formattedMessage = err.errors
         .map(error => error.message)
         .join('; ')
        
        checkIsDebug() && logDebug(`Sequelize: [ValidationError] ${formattedMessage}`, req)

        return BadRequest(`Sequelize: [ValidationError] ${isDevEnvironment ? formattedMessage : 'validation error'}`);
    } 
    // 503
    else if (err instanceof sequelize.ConnectionRefusedError ) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [ConnectionRefusedError] ${isDevEnvironment ?  formattedMessage : 'Database connection error occurred'}`);
    }
    else if (err instanceof sequelize.HostNotFoundError ) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [HostNotFoundError] ${isDevEnvironment ?  formattedMessage : 'Database connection error occurred'}`);
    }
    else if (err instanceof sequelize.HostNotReachableError ) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [HostNotReachableError] ${isDevEnvironment ?  formattedMessage : 'Database connection error occurred'}`);
    }
    else if (err instanceof sequelize.AccessDeniedError ) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [AccessDeniedError] ${isDevEnvironment ?  formattedMessage : 'Database connection error occurred'}`);
    }
    else if (err instanceof sequelize.ConnectionAcquireTimeoutError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [ConnectionAcquireTimeoutError] ${isDevEnvironment ?  formattedMessage : 'Database connection error occurred'}`);
    }
    else if (err instanceof sequelize.ConnectionError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`Sequelize: [ConnectionError] ${isDevEnvironment ? formattedMessage : 'Database connection error occurred'}`);
    }

}

module.exports = {sequelizeMapper}