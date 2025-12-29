const { checkIsDev } = require("../../config/config");
const { checkIsDebug } = require("../../config/config");
const HttpStatus = require("../../constants/httpStatus");
const { logDebug } = require("../../logger/logger");
const { BadRequest, Conflict, NotFound, ServiceUnavailable, InternalServerError } = require("../presets");

const prismaMapper = (err, req) => {
    const isDevEnvironment = checkIsDev()
    const isPrisma = err.clientVersion && typeof err.clientVersion === 'string'

    if(isPrisma) {
        const {target, field_name } = err.meta || {}
        
        let formattedDetail;

        if (Array.isArray(target)) formattedDetail = `Target: [${target.join('; ')}]`
        
        else if (typeof field_name === 'string') formattedDetail = `Field Name: ${field_name}`

        else if (err.meta) formattedDetail = err.message === prismaCodes[err.code].dev ? Object.entries(err.meta).map(([key, value]) => `${key}: ${value}`).join("; ") : err.message

        else formattedDetail = "Unknown Prisma error detail";

        const hasCode = Boolean(err?.code)
        const formattedMessage = `${hasCode ? prismaCodes[err.code].dev : ''}: ${formattedDetail}`

        checkIsDebug() && logDebug(`Prisma error: ${formattedMessage}`, req)

        const prismaError = prismaCodes[err.code]

        if (prismaError) {
            const handler = prismaCodeToHttpHandler[prismaError.status]

            if (handler) {
                return handler(isDevEnvironment ? formattedMessage : prismaError.prod)
            }
        }

    }
}

const prismaCodeToHttpHandler = {
  [HttpStatus.NOT_FOUND]: NotFound,
  [HttpStatus.CONFLICT]: Conflict,
  [HttpStatus.BAD_REQUEST]: BadRequest,
  [HttpStatus.INTERNAL_SERVER_ERROR]: InternalServerError,
  [HttpStatus.SERVICE_UNAVAILABLE]: ServiceUnavailable,
}

const prismaCodes = {
  P2000: { dev: 'Value too long for column', prod: 'Invalid input', status: HttpStatus.BAD_REQUEST },
  P2001: { dev: 'Record does not exist', prod: 'Resource not found', status: HttpStatus.NOT_FOUND },
  P2002: { dev: 'Unique constraint failed', prod: 'Conflict', status: HttpStatus.CONFLICT },
  P2003: { dev: 'Foreign key constraint failed', prod: 'Invalid reference', status: HttpStatus.BAD_REQUEST },
  P2014: { dev: 'Required relation violation', prod: 'Invalid relation', status: HttpStatus.BAD_REQUEST },
  P2015: { dev: 'Related record not found', prod: 'Resource not found', status: HttpStatus.NOT_FOUND },
  P2025: { dev: 'Record not found', prod: 'Resource not found', status: HttpStatus.NOT_FOUND },

  P2021: { dev: 'Table does not exist', prod: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR },
  P2022: { dev: 'Column does not exist', prod: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR },
  P1001: { dev: 'Cannot reach database', prod: 'Service unavailable', status: HttpStatus.SERVICE_UNAVAILABLE },
  P1002: { dev: 'Database timeout', prod: 'Service unavailable', status: HttpStatus.SERVICE_UNAVAILABLE },
  P1003: { dev: 'Database does not exist', prod: 'Internal server error', status: HttpStatus.INTERNAL_SERVER_ERROR },
}




module.exports = {prismaMapper}