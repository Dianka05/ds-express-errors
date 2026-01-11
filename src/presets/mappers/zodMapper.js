const { checkIsDev } = require("../../config/config")
const { config } = require("../../config/config")
const { checkIsDebug } = require("../../config/config")
const { logDebug } = require("../../logger/logger")
const { BadRequest } = require("../presets")

const zodMapper = (err, req) => {

    const zodErrorClass = config?.errorClasses?.Zod;
    if (zodErrorClass && err instanceof zodErrorClass.ZodError) {
        return sendResponseForMappedError(err, req)
    }

    if (Array.isArray(err.issues) && err.issues[0]?.path) {
        return sendResponseForMappedError(err, req)
    }
}

const sendResponseForMappedError = (err, req) => {
    const isDevEnvironment = checkIsDev()
    const formattedMessages = getFormattedMessage(err)

    checkIsDebug() && logDebug(`Zod validation error issues: ${formattedMessages}`, req)

    return BadRequest(`Validation error: ${isDevEnvironment ? formattedMessages : 'validation error'}`)
}

const getFormattedMessage = (err) => {
    const formattedMessages = err.issues.map(issue => {
        const path = issue.path.join('.')
        return `${path ? path + ': '  : ''}${issue.message}`
    }).join('; ')

    return formattedMessages
}



module.exports = {zodMapper}