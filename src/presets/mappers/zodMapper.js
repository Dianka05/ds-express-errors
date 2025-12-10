const { checkIsDev } = require("../../config/config")
const { checkIsDebug } = require("../../config/config")
const { BadRequest } = require("../presets")

const zodMapper = (err) => {
    const isDevEnvironment = checkIsDev()
     if (Array.isArray(err.issues) && err.issues[0]?.path) { //ZOD
        const formattedMessages = err.issues.map(issue => {
            const path = issue.path.join('.')
            return `${path ? path + ': '  : ''}${issue.message}`
        }).join('; ')

        checkIsDebug() && logDebug(`Zod validation error issues: ${formattedMessages}`, req)

        return BadRequest(`Validation error: ${isDevEnvironment ? formattedMessages : 'validation error'}`)
    }
}

module.exports = {zodMapper}