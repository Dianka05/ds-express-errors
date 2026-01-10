import { Request } from 'express'
import { AppError } from "../errors/AppError"

export interface ConfigOptions {
    req: Request
    isDev: boolean
}

export interface ErrorClasses {
    Zod?: { ZodError: new (...args: any[]) => Error }
    Joi?: { ValidationError: new (...args: any[]) => Error }
}

export interface Logger {
    error(message: any, ...args: any[]): void
    warn(message: any, ...args: any[]): void
    info(message: any, ...args: any[]): void
    debug(message: any, ...args: any[]): void
} 

export interface ErrorMapper {
    (err: AppError | Error, req: Request): AppError | Error | undefined | null;
}

export interface ErrorConfig {
    customLogger?: Logger | null
    customMappers?: ErrorMapper[]
    errorClasses?: ErrorClasses
    devEnvironments?: string[]
    needMappers?: string[]
    formatError?: (err: AppError | Error, options: ConfigOptions) => any
}

export function setConfig(options: Partial<ErrorConfig>): void