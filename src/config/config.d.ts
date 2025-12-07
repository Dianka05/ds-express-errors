import { Request } from 'express'
import { AppError } from "../errors/AppError"

export interface ConfigOptions {
    req: Request
    isDev: boolean
}

export interface ErrorMapper {
    (err: AppError | Error, req: Request): AppError | Error | undefined | null;
}

export interface ErrorConfig {
    customMappers: ErrorMapper[]
    devEnvironments: string[]
    formatError: (err: AppError | Error, options: ConfigOptions) => any
}

export function setConfig(options: Partial<ErrorConfig>): void