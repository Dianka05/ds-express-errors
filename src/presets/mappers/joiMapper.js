const { config } = require("../../config/config");
const { checkIsDebug } = require("../../config/config");
const { logDebug } = require("../../logger/logger");
const { BadRequest } = require("../presets");

const joiMapper = (err, req) => {
    const joiErrorClass = config?.errorClasses?.Joi;
    if (joiErrorClass && err instanceof joiErrorClass.ValidationError) {
        return sendResponseForMappedError(err, req)
    }

    if (err.isJoi === true && Array.isArray(err.details)) {
        return sendResponseForMappedError(err, req)
    }
}

const sendResponseForMappedError = (err, req) => {
    const formattedMessage = getFormattedMessage(err)
            
    checkIsDebug() && logDebug(`Joi validation error details: ${formattedMessage}`, req)

    return BadRequest('[Validation Error]: ' + formattedMessage);
}

const getFormattedMessage = (err) => {
    const formattedMessages = err.details
    .map(detail => detail.message.replace(/"/g, ''))
    .join('; ')

    return formattedMessages
}


module.exports = {joiMapper}