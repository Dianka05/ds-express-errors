const { CONFIG_CODES } = require("../../constants/errorCodes")
const InternalError = require("./InternalError")

class ConfigAlreadySet extends InternalError {
    constructor(message, caller) {
        super(message, CONFIG_CODES.CONFIG_ALREADY_SET, caller)
    }
}

class ConfigSettingMissing extends InternalError {
    constructor(message, caller) {
        super(message, CONFIG_CODES.CONFIG_SETTING_MISSING, caller)
    }
}

class ConfigInvalid extends InternalError {
    constructor(message, caller) {
        super(message, CONFIG_CODES.CONFIG_INVALID, caller)
    }
}


module.exports = {ConfigAlreadySet, ConfigInvalid, ConfigSettingMissing}