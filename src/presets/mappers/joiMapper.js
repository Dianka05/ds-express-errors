const { checkIsDev } = require("../../config/config");
const { checkIsDebug } = require("../../config/config");
const { BadRequest } = require("../presets");

const joiMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    if (err.isJoi === true && Array.isArray(err.details)) { //JOI
        const formattedMessage = err.details
            .map(detail => detail.message.replace(/"/g, ''))
            .join('; ')
            
        checkIsDebug() && logDebug(`Joi validation error details: ${formattedMessage}`, req)

        return BadRequest(`Validation Error: ${isDevEnvironment ? formattedMessage : 'validation error'}`);
    }
}

module.exports = {joiMapper}