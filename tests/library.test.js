process.env.NODE_ENV = 'development';

const { errorHandler } = require('../src/middleware/errorHandler');
const { asyncHandler } = require('../src/middleware/asyncHandler');
const { Errors } = require('../index'); 
const AppError = require('../src/errors/AppError');

global.console.error = jest.fn();
global.console.warn = jest.fn();
global.console.log = jest.fn();
global.console.debug = jest.fn();

describe('DS Express Errors Library', () => {
    
    describe('AppError & Presets', () => {
        test('should create AppError correctly', () => {
            const err = new AppError('Test Error', 418, false);
            expect(err.message).toBe('Test Error');
            expect(err.statusCode).toBe(418);
            expect(err.isOperational).toBe(false);
        });

        test('BadRequest preset creates correct error', () => {
            const err = Errors.BadRequest('Bad input');
            expect(err).toBeInstanceOf(AppError);
            expect(err.statusCode).toBe(400);
            expect(err.message).toBe('Bad input');
            expect(err.isOperational).toBe(true);
        });

        test('InternalServerError defaults', () => {
            const err = Errors.InternalServerError();
            expect(err.statusCode).toBe(500);
            expect(err.isOperational).toBe(false);
        });
    });

    describe('asyncHandler Middleware', () => {
        test('should call next with error if promise rejects', async () => {
            const error = new Error('Async Boom');
            const failingFn = async () => { throw error; };
            
            const req = {};
            const res = {};
            const next = jest.fn();

            await asyncHandler(failingFn)(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });

        test('should NOT call next if promise resolves', async () => {
            const successFn = async (req, res, next) => { return 'Success'; };
            const req = {}; 
            const res = {};
            const next = jest.fn();

            await asyncHandler(successFn)(req, res, next);
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('errorHandler Middleware', () => {
        let req, res, next;

        beforeEach(() => {
            req = { method: 'GET', originalUrl: '/test' };
            res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            next = jest.fn();
        });

        test('should handle AppError correctly', () => {
            
            const error = new AppError('Custom Error', 400, true);
            
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'fail',
                message: 'Custom Error',
                stack: expect.any(String)
            }));
        });

        test('should map generic Error to 500', () => {
            const error = new Error('Random Crash');
            
            errorHandler(error, req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'error',
                message: 'Random Crash'
            }));
        });

        test('should map Mongoose duplicate key error (code 11000)', () => {
            const mongooseError = { 
                name: 'MongoError', 
                code: 11000, 
                keyValue: { email: 'test@test.com' } 
            };
            
            errorHandler(mongooseError, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Duplicate field value')
            }));
        });


        test('should handle Zod validation error', () => {
            const zodError = {
                name: 'ZodError',
                issues: [
                    {
                        path: ['user', 'email'],
                        message: 'Invalid email address'
                    },
                    {
                        path: ['age'],
                        message: 'Too small'
                    }
                ]
            }
            
            errorHandler(zodError, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: 'fail',
                    message: expect.stringContaining('Validation error: user.email: Invalid email address; age: Too small')
                })
            )
            
        });

        test('should handle Joi validation error', () => {
            const joiError = {
                isJoi: true,
                name: 'ValidationError',
                details: [
                    {
                        message: '"password" is required',
                        path: ['password']
                    }
                ]
            };
            
            errorHandler(joiError, req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'fail',
                message: expect.stringContaining('password is required')
            }));
        });

    });
});