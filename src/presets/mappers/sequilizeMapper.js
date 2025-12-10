const { checkIsDev } = require("../../config/config")
const { checkIsDebug } = require("../../config/config")
const { BadRequest } = require("../presets")

const sequlizeMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    const { name, message } = err

    const isSequelizeValidationError = name === 'SequelizeValidationError' && Array.isArray(err.errors)
    const isSequelizeForeignKeyError = name === 'SequelizeForeignKeyConstraintError' && Array.isArray(err.fields)

    if (isSequelizeValidationError) {
        const formattedMessage = err.errors
            .map(error => error.message)
            .join('; ')
            
        checkIsDebug() && logDebug(`Sequelize validation error: ${formattedMessage}`, req)

        return BadRequest(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'validation error'}`);
    } else if (isSequelizeForeignKeyError) {
         const formattedMessage = `Fields: "${err.fields.join('; ')}"; ${message}`
            
        checkIsDebug() && logDebug(`Sequelize foreign key error: ${formattedMessage}`, req)

        return BadRequest(`${isDevEnvironment ? `${name}: ` + formattedMessage : 'foreign key error'}`);
    }
}

module.exports = {sequlizeMapper}