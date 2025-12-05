import { NextFunction, Request, Response } from 'express'

export function asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => any
): (req: Request, res: Response, next: NextFunction) => void