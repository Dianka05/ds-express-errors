import { NextFunction, Request, Response } from 'express'
import { AppError } from "../errors/AppError"

export interface GlobalHandlerOptions {
    exitOnUnhandledRejection?: boolean
    exitOnUncaughtException?: boolean
    onCrash?: () => void
}

export function gracefulHttpClose(server: any): (signal?: AbortSignal) => Promise<void>

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void

export function initGlobalHandlers(options?: GlobalHandlerOptions): void