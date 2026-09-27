const { Unauthorized } = require('../presets');

const jwtMapper = (err, req, isDevEnvironment) => {
    const {name, message} = err

    if (name === 'JsonWebTokenError') {
        return Unauthorized(isDevEnvironment ? `[JsonWebTokenError]: ${message}` : 'Session expired. Please log in again.')
    }
    if (name === 'TokenExpiredError') {
        return Unauthorized(isDevEnvironment ? `[TokenExpiredError]: ${message}` : 'Authentication token has expired')
    }
    if (name === 'NotBeforeError') {
        return Unauthorized(isDevEnvironment ? `[NotBeforeError]: ${message}` : 'Invalid token visualization.')
    }
    if (name === 'UnauthorizedError') {
        return Unauthorized(isDevEnvironment ? `[UnauthorizedError]: ${message}` : 'Access denied.')
    }
}


module.exports = {jwtMapper}