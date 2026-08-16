const { checkIsDev } = require("../../config/config")
const { Unauthorized } = require('../presets');

const jwtMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    const {name, message} = err

    if (name === 'JsonWebTokenError') {
        return Unauthorized(isDevEnvironment ? `[JsonWebTokenError]: ${message}` : 'Session expired. Please log in again.')
    }
    if (name === 'TokenExpiredError') {
        return Unauthorized(isDevEnvironment ? `[TokenExpiredError]: ${message}` : 'Authentication failed.')
    }
    if (name === 'NotBeforeError') {
        return Unauthorized(isDevEnvironment ? `[NotBeforeError]: ${message}` : 'Invalid token visualization.')
    }
    if (name === 'UnauthorizedError') {
        return Unauthorized(isDevEnvironment ? `[UnauthorizedError]: ${message}` : 'Access denied.')
    }
}


module.exports = {jwtMapper}