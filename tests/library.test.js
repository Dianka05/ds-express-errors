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
    beforeAll(() => {
        process.env.DEBUG = 'true'; 
    });
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
    describe('Custom Logger Integration', () => {
        const { setConfig } = require('../src/config/config');
        const { errorHandler } = require('../src/middleware/errorHandler');

        test('should use custom logger if provided', () => {
            const customLogger = {
                error: jest.fn(),
                info: jest.fn(),
                warn: jest.fn(),
                debug: jest.fn(),
            };

            setConfig({ customLogger });

            const error = new Error('Logger Test');
            errorHandler(error, {}, { status: () => ({ json: () => {} }) }, () => {});

            expect(customLogger.error).toHaveBeenCalled();
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

        describe('Mongoose Errors Handling', () => {
            test('should handle Mongoose validation error', () => {
                const mongooseValidationError = {
                    name: "ValidationError",
                    message: "User validation failed",
                    errors: {
                        email: {
                        name: "ValidatorError",
                        message: "Email is required",
                        kind: "required",
                        path: "email",
                        value: ""
                        },
                        age: {
                        name: "ValidatorError",
                        message: "Age must be a number",
                        kind: "Number",
                        path: "age",
                        value: "abc"
                        }
                    }
                };
                
                errorHandler(mongooseValidationError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    status: 'fail',
                    message: expect.stringContaining('Email is required = [Value]: \"\"; Age must be a number = [Value]: \"abc\"')
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
            test('should map Mongoose Cast Error', () => {
                const mongooseCastError = {
                    name: "CastError",
                    message: 'Cast to Number failed for value "abc" at path "age"',
                    kind: "Number",
                    value: "abc",
                    path: "age",
                    reason: {}
                };
                
                errorHandler(mongooseCastError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('CastError: Cast to Number failed for value \"abc\" at path \"age\"')
                }));
            });
        })

        describe('Sequilize Errors Handling', () => {
            test('should map Sequelize Foreign Key Error', () => {
                const sequelizeForeignKeyError = {
                    name: "SequelizeForeignKeyConstraintError",
                    message: "insert or update on table violates foreign key constraint",
                    fields: ["userId"],
                    table: "Orders",
                    index: "orders_userId_fkey",
                    reltype: "foreign key"
                };
                
                errorHandler(sequelizeForeignKeyError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('SequelizeForeignKeyConstraintError: Fields: \"userId\"; insert or update on table violates foreign key constraint')
                }));
            });
            test('should map Sequelize Unique Error', () => {
                const sequelizeUniqueError = {
                    name: "SequelizeUniqueConstraintError",
                    message: "email must be unique",
                    errors: [
                        {
                            message: "email must be unique",
                            type: "unique violation",
                            path: "email",
                            value: "user@example.com",
                            origin: "DB"
                        }
                    ],
                    fields: {
                        email: "user@example.com"
                    }
                };
                
                errorHandler(sequelizeUniqueError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('SequelizeUniqueConstraintError: email must be unique')
                }));
            });
            test('should map Sequelize Validation Error', () => {
                const sequelizeValidationError = {
                    name: "SequelizeValidationError",
                    message: "Validation error",
                    errors: [
                        {
                            message: "email must be unique",
                            type: "unique violation",
                            path: "email",
                            value: "test@example.com",
                            origin: "DB",
                            instance: undefined,
                            validatorKey: "not_unique"
                        },
                        {
                            message: "Age must be an integer",
                            type: "Validation error",
                            path: "age",
                            value: "abc",
                            origin: "FUNCTION",
                            validatorKey: "isInt"
                        }
                    ]
                };
                
                errorHandler(sequelizeValidationError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('SequelizeValidationError: email must be unique; Age must be an integer')
                }));
            });
        })

        describe('Prisma Errors Handling', () => {
            test('should map Prisma Foreign Key P2003', () => {
                const prismaError = {
                    code: "P2003",
                    clientVersion: "5.0.0",
                    message: "Foreign key constraint failed",
                    meta: {
                        field_name: "userId"
                    }
                }
                
                errorHandler(prismaError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('[P2003]: Field Name: userId; [MESSAGE] Foreign key constraint failed')
                }));
            });
            test('should map Prisma Error P2002', () => {
                const prismaError = {
                    code: "P2002",
                    clientVersion: "5.0.0",
                    message: "Unique constraint failed on the fields: (`email`, `age`)",
                    meta: {
                        target: ["email", "age"]
                    }
                }
                
                errorHandler(prismaError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('[P2002]: Target: [email; age]; [MESSAGE] Unique constraint failed on the fields: (`email`, `age`)')
                }));
            });
            test('should map Prisma Error', () => {
                const prismaError = {
                    clientVersion: "5.0.0",
                    message: "Some error",
                }
                
                errorHandler(prismaError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('Unknown Prisma error detail; [MESSAGE] Some error')
                }));
            });
        })

        describe('Syntax Error', () => {

            test('should map JSON parse error to 400', () => {
                const error = new SyntaxError("Unexpected token '<', \"<HTML><HEA\"... is not valid JSON");

                errorHandler(error, req, res, next);

                expect(res.status).toHaveBeenCalledWith(400);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining("Unexpected token '\u003C', \"\u003CHTML\u003E\u003CHEA\"... is not valid JSON")
                }));
            });

            test('should map SyntaxError to 500', () => {
                const error = new SyntaxError("Unexpected token ':'");

                errorHandler(error, req, res, next);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining("Unexpected token ':'")
                }));
            });
        })

        describe('Production Mode Security', () => {
            const { setConfig } = require('../src/config/config');
            
            beforeAll(() => {
                process.env.NODE_ENV = 'production';
                setConfig({ devEnvironments: ['dev', 'development'] });
            });

            afterAll(() => {
                process.env.NODE_ENV = 'development';
            });

            test('should hide stack trace in production', () => {
                const error = new Error('Secret Database Info');
                errorHandler(error, req, res, next);
                
                expect(res.json).toHaveBeenCalledWith(expect.not.objectContaining({
                    url: expect.anything(),
                    method: expect.anything(),
                    stack: expect.anything()
                }));
            });

            test('should hide detailed Mongoose validation errors in production', () => {
                const mongooseValidationError = {
                    name: "ValidationError",
                    errors: {
                        email: { message: "Internal Validator Failed", value: "sensitive_data" }
                    }
                };
                errorHandler(mongooseValidationError, req, res, next);

                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: 'validation error' 
                }));
            });
        });

        describe('JWT (JSON Web Token)', () => {
            test('should map JsonWebTokenError to 401 Unauthorized', () => {
                const jwtError = { name: 'JsonWebTokenError', message: 'invalid token' };
                
                errorHandler(jwtError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('JsonWebTokenError: invalid token')
                }));
            });

            test('should map TokenExpiredError to 401', () => {
                const expiredError = { name: 'TokenExpiredError', message: 'jwt expired' };
                errorHandler(expiredError, req, res, next);
                expect(res.status).toHaveBeenCalledWith(401);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('TokenExpiredError: jwt expired')
                }));
            });
        })

        describe('Library tests', () => {
            const { Errors } = require('../index');

            test('should handle non-object errors gracefully', () => {
                const stringError = "I am just a string";
                
                errorHandler(stringError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(500);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: expect.stringContaining('Non-object error received')
                }));
            });

            test.each([
                ['BadRequest', 400],
                ['Unauthorized', 401],
                ['PaymentRequired', 402],
                ['Forbidden', 403],
                ['NotFound', 404],
                ['Conflict', 409],
                ['TooManyRequests', 429],
                ['InternalServerError', 500],
                ['NotImplemented', 501],
                ['BadGateway', 502],
                ['ServiceUnavailable', 503]
            ])('Errors.%s should return status %i', (methodName, statusCode) => {
                const err = Errors[methodName]('Test');
                expect(err.statusCode).toBe(statusCode);
            });
        })

         describe('Custom Mappers Configuration', () => {
            const { setConfig } = require('../src/config/config');

            test('should use custom mapper if provided', () => {
                setConfig({
                    customMappers: [
                        (err) => {
                            if (err.message === 'ImATeapot') return new AppError('Teapot Error', 418);
                        }
                    ]
                });

                const weirdError = new Error('ImATeapot');
                errorHandler(weirdError, req, res, next);

                expect(res.status).toHaveBeenCalledWith(418);
                expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                    message: 'Teapot Error'
                }));
            });
        });

    });

    
});