import { NextFunction, Request, Response } from 'express'
import { AppError } from "../errors/AppError"

export interface GlobalHandlerOptions {
    exitOnUnhandledRejection?: boolean
    exitOnUncaughtException?: boolean
    onCrash?: (error: any, signal?: AbortSignal) => Promise<void> | void
    onShutdown?: (signal?: AbortSignal) => Promise<void> | void
    closeServer?: (signal?: AbortSignal) => Promise<void> | void
    maxTimeout?: number
}

export function gracefulHttpClose(server: any): (signal?: AbortSignal) => Promise<void>

export function errorHandler(err: Error | AppError, req: Request, res: Response, next: NextFunction): void

export function initGlobalHandlers(options?: GlobalHandlerOptions): void