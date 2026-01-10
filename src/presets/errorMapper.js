const { config } = require("../config/config")
const { checkIsDebug } = require("../config/config")
const { checkIsDev } = require("../config/config")
const { logWarning, logDebug } = require("../logger/logger")
const { safeStringify } = require("../utils/safeStringify")
const { customMapper } = require("./mappers/customMapper")
const { expressValidatorMapper } = require("./mappers/expressValidatorMapper")
const { joiMapper } = require("./mappers/joiMapper")
const { mongooseMapper } = require("./mappers/mongooseMapper")
const { nameMapper } = require("./mappers/nameMapper")
const { prismaMapper } = require("./mappers/prismaMapper")
const { sequelizeMapper } = require("./mappers/sequelizeMapper")
const { zodMapper } = require("./mappers/zodMapper")
const { presetErrors, InternalServerError } = require("./presets")

const allMappers = {
    custom: customMapper,
    zod: zodMapper,
    joi: joiMapper,
    mongoose: mongooseMapper,
    prisma: prismaMapper,
    sequelize: sequelizeMapper,
    expressValidator: expressValidatorMapper,
    name: nameMapper
};

const mapErrorNameToPreset = (err, req) => {

    const isDevEnvironment = checkIsDev()

    if (!err || typeof err !== 'object') {
        logWarning(`Non-object error received in mapErrorNameToPreset: ${safeStringify(err)}`, req)
        return InternalServerError(isDevEnvironment ? `Non-object error received: ${safeStringify(err)}` : "An unexpected error occurred.")
    }

    const { name, code, message } = err

    const getActiveMappers = () => {
        const needMappers = config?.needMappers
        if (needMappers === null && !Array.isArray(needMappers)) {
            return Object.values(allMappers)
        }

        return needMappers.map(n => allMappers[n]).filter(Boolean)
    }

    const mappers = getActiveMappers()
    
    for (const mapper of mappers) {
        const mapperFunc = mapper(err, req)
        if (mapperFunc) return mapperFunc
    }

    const presetError = presetErrors[name]

    if (presetError) {
        return presetError(`${name}: ${message}`)
    }
    if (isDevEnvironment || checkIsDebug()) {
        logDebug(`[Unknown error mapping]: => Name: ${name}, ${code ? `| Code: ${code}`: ''}, | Message: ${message}`, req)
    }
    
    return InternalServerError(isDevEnvironment ? message : "An unexpected error occurred.")
}

module.exports = {mapErrorNameToPreset}