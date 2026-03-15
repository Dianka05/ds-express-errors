const { GLOBAL_HANDLER_CODES } = require("../../constants/errorCodes")
const InternalError = require("./InternalError")

class GlobalHandlerAlreadySet extends InternalError {
    constructor(message, caller) {
        super(message, GLOBAL_HANDLER_CODES.GLOBAL_HANDLER_ALREADY_SET, caller)
    }
}

class GlobalHandlerInvalid extends InternalError {
    constructor(message, caller) {
        super(message, GLOBAL_HANDLER_CODES.GLOBAL_HANDLER_INVALID, caller)
    }
}

class GlobalHandlerSettingMissing extends InternalError {
    constructor(message, caller) {
        super(message, GLOBAL_HANDLER_CODES.GLOBAL_HANDLER_SETTING_MISSING, caller)
    }
}

module.exports = {GlobalHandlerAlreadySet, GlobalHandlerInvalid, GlobalHandlerSettingMissing}