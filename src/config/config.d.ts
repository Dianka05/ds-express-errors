import { Request } from 'express'
import { AppError } from "../errors/AppError"

export interface ConfigOptions {
    req: Request
    isDev: boolean
}

export interface ErrorConfig {
    formatError: (err: AppError | Error, options: ConfigOptions) => any
}

export function setConfig(options: Partial<ErrorConfig>): void