const { checkIsDev } = require("../../config/config")
const { safeStringify } = require("../../utils/safeStringify")
const { BadRequest } = require("../presets")

const mongooseMapper = (err) => {
    const isDevEnvironment = checkIsDev()
    const { name, code } = err

    if (code === 11000 || code === 11001) { //MONGOOSE
        return BadRequest(`Duplicate field value entered${isDevEnvironment ? ": "+ safeStringify(err.keyValue).replace(/"/g, '') : ''}`)
    } else if (name === 'ValidationError' && err.errors) {
        const {errors} = err
        const formattedMessage = Object.values(errors)
            .map(e => {
                return `${e.message} = [Value]: "${e.value}"`
            }).join('; ')
        return BadRequest(`${isDevEnvironment ? formattedMessage : 'validation error'}`)
    }
}

module.exports = {mongooseMapper}