class InternalError extends Error {
    constructor(message, code, caller) {
        super(message)
        this.name = this.constructor.name
        this.code = code || 'ERR_DS_EXPRESS_ERRORS_INTERNAL'

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller || this.constructor)
        }
    }
}

module.exports = InternalError