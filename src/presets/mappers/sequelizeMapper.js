const { checkIsDev, checkIsDebug } = require("../../config/config")
const { logDebug } = require("../../logger/logger")
const { safeStringify } = require("../../utils/safeStringify")
const { GatewayTimeout } = require("../presets")
const { BadRequest, Conflict, NotFound, InternalServerError, ServiceUnavailable } = require("../presets")

const sequelizeMapper = (err, req) => {
    const isDevEnvironment = checkIsDev()
    const { name, message } = err

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
    } else if (isSequelizeDatabaseError) {
        const formattedMessage = `SQL: ${err.sql}; Parent Code: ${err.parent.code}; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize database error: ${formattedMessage}`, req)

        return InternalServerError(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database error occurred'}`);
    } else if (isSequelizeConnectionError) {
        const formattedMessage = message
            
        checkIsDebug() && logDebug(`Sequelize connection error: ${formattedMessage}`, req)

        return ServiceUnavailable(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database connection error occurred'}`);
    } else if (isSequelizeTimeoutError) {
        const formattedMessage = message
        checkIsDebug() && logDebug(`Sequelize timeout error: ${formattedMessage}`, req)

        return GatewayTimeout(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'Database timeout error occurred'}`);
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
    } 
}

module.exports = {sequelizeMapper}