class ConfigError extends Error {
    constructor(message, caller) {
        super(message)
        this.name = 'DsConfigError'

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, caller)
        }
    }
}

module.exports = ConfigError