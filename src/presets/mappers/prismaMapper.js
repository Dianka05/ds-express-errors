const { checkIsDev } = require("../../config/config");
const { checkIsDebug } = require("../../config/config");
const { logDebug } = require("../../logger/logger");
const { BadRequest } = require("../presets");

const prismaMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    const isPrisma = err.clientVersion && typeof err.clientVersion === 'string'

    if(isPrisma) {
        const {target, field_name } = err.meta || {}
        
        let formattedDetail;

        if (Array.isArray(target)) formattedDetail = `Target: [${target.join('; ')}]`
        
        else if (typeof field_name === 'string') formattedDetail = `Field Name: ${field_name}`

        else formattedDetail = "Unknown Prisma error detail";

        const hasCode = err.code ? `[${err.code}]: ` : '' 
        const formattedMessage = `${hasCode}${formattedDetail}; [MESSAGE] ${err.message}`

        checkIsDebug() && logDebug(`Prisma error: ${formattedMessage}`, req)

        return BadRequest(isDevEnvironment ? formattedMessage : `Prisma error ${hasCode}`);
    }
}

module.exports = {prismaMapper}