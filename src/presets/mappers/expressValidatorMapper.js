const { checkIsDev } = require("../../config/config")
const { UnprocessableContent, BadRequest } = require("../presets")

const expressValidatorMapper = (err) => {
    const isDevEnvironment = checkIsDev()

    const isExpressValidatorError = err =>
       err?.errors && Array.isArray(err.errors)

    if (isExpressValidatorError) {
        const { errors, message } = err
    
        const fError = Array.isArray(errors) ? errors[0] : null

        const {type, value, msg, path, nestedErrors  } = fError || {}

        const isFieldValidationError = isExpressValidatorError && type === types.field
        const isAlternativeValidationError = isExpressValidatorError && type === types.alternative
        const isGroupedAlternativeValidationError = isExpressValidatorError && type === types.alternative_grouped
        const isUnknownFieldsError = isExpressValidatorError && type === types.unknown_fields

        const outputMessage = msg || message
        
        let _errors = ''

        if (nestedErrors && nestedErrors.length > 0) {
                _errors = nestedErrors?.map(nestedError => {
                    if (isUnknownFieldsError) return `path: ${nestedError[0]?.path}; location: ${nestedError[0]?.location}; value: ${nestedError[0]?.value}`
                    return `${nestedError[0]?.path}`
                }).join('; ')
        } else if (path) {
            _errors = path
        } else {
            _errors = ''
        }
    
        if (isFieldValidationError || isAlternativeValidationError || isGroupedAlternativeValidationError) {
            return UnprocessableContent(isDevEnvironment ? outputMessage + `: ${(_errors || value) || ('')}` : 'Unprocessable Content')
        }
    
        if (isUnknownFieldsError ) {
            return BadRequest(isDevEnvironment ? outputMessage + `: ${_errors}` : 'Invalid input')
        }

    }
}

const types = {
    field: 'field', //422
    alternative: 'alternative',  //422
    alternative_grouped: 'alternative_grouped',  //422
    unknown_fields: 'unknown_fields'  //400
}

module.exports = {expressValidatorMapper}