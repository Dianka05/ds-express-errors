import { Request } from 'express';
import { AppError } from '../errors/AppError';

export function mapErrorNameToPreset(err: any, req?: Request): AppError