import { AppError } from "../errors/AppError";

export function logError(err: AppError, req?: Request): void;

export function logWarning(message: string, req?: Request): void;

export function logDebug(message: string, req?: Request): void;

export function logInfo(message: string): void;