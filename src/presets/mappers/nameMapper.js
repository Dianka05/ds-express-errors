const { checkIsDev } = require("../../config/config")
const HttpStatus = require("../../constants/httpStatus")
const { BadRequest } = require("../presets")

const nameMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    const { name, message } = err

    if (name === 'CastError' && !isDevEnvironment) {
        return BadRequest(`Invalid value for field: ${err.path}`)
    }

    if (name === 'SyntaxError') {
        const isBadRequestCode = err.status === HttpStatus.BAD_REQUEST || err.statusCode === HttpStatus.BAD_REQUEST
        const isJsonError = message.includes('JSON')
        if (isBadRequestCode || isJsonError) {
            return BadRequest(isDevEnvironment ? message : "Invalid JSON format")        
        }
    }
}

module.exports = {nameMapper}