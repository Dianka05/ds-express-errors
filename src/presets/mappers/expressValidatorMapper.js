const { checkIsDev } = require("../../config/config")
const { UnprocessableContent, BadRequest } = require("../presets")

const expressValidatorMapper = (err) => {
    const isDevEnvironment = checkIsDev()

    const { type, value, msg, message, nestedErrors } = err
    
    const isFieldValidationError = type === types.field
    const isAlternativeValidationError = type === types.alternative
    const isGroupedAlternativeValidationError = type === types.alternative_grouped
    const isUnknownFieldsError = type === types.unknown_fields

    const outputMessage = msg || message;
    
    const _nestedErrors = nestedErrors?.map((nestedError) => {
        if (isUnknownFieldsError) return `path: ${nestedError?.path}; location: ${nestedError?.location}; value: ${nestedError?.value}`
        return `${nestedError?.path}`
    }).join('; ')

    if (isFieldValidationError || isAlternativeValidationError || isGroupedAlternativeValidationError) {
        return UnprocessableContent(isDevEnvironment ? outputMessage + `: ${_nestedErrors || value}` : 'Unprocessable Content')
    }

    if (isUnknownFieldsError) {
        return BadRequest(isDevEnvironment ? outputMessage + `: ${_nestedErrors}` : 'Invalid input')
    }
}

const types = {
    field: 'field', //422
    alternative: 'alternative',  //422
    alternative_grouped: 'alternative_grouped',  //422
    unknown_fields: 'unknown_fields'  //400
}

module.exports = {expressValidatorMapper}