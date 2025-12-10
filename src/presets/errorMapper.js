const { checkIsDebug } = require("../config/config")
const { checkIsDev } = require("../config/config")
const { logWarning, logDebug } = require("../logger/logger")
const { safeStringify } = require("../utils/safeStringify")
const { customMapper } = require("./mappers/customMapper")
const { joiMapper } = require("./mappers/joiMapper")
const { mongooseMapper } = require("./mappers/mongooseMapper")
const { nameMapper } = require("./mappers/nameMapper")
const { prismaMapper } = require("./mappers/prismaMapper")
const { sequelizeMapper } = require("./mappers/sequelizeMapper")
const { zodMapper } = require("./mappers/zodMapper")
const { presetErrors, InternalServerError } = require("./presets")

const mappers = [
    customMapper, 
    zodMapper, 
    joiMapper, 
    mongooseMapper, 
    prismaMapper, 
    sequelizeMapper, 
    nameMapper
]

const mapErrorNameToPreset = (err, req) => {
    const isDevEnvironment = checkIsDev()

    if (!err || typeof err !== 'object') {
        logWarning(`Non-object error received in mapErrorNameToPreset: ${safeStringify(err)}`, req)
        return InternalServerError(isDevEnvironment ? `Non-object error received: ${safeStringify(err)}` : "An unexpected error occurred.")
    }

    const { name, code, message } = err

    for (const mapper of mappers) {
        console.log('mapper: ', mapper)
        const mapperFunc = mapper(err, req)
        if (mapperFunc) return mapperFunc
    }

    const presetError = presetErrors[name]

    if (presetError) {
        return presetError(`${name}: ${message}`)
    }
    if (isDevEnvironment || checkIsDebug()) {
        logDebug(`[Unknown error mapping]: => Name: ${name}, | Code: ${code}, | Message: ${message}`, req)
    }
    
    return InternalServerError(isDevEnvironment ? message : "An unexpected error occurred.")
}

module.exports = {mapErrorNameToPreset}