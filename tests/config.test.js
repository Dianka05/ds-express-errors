const { errorHandler } = require('../src/middleware/errorHandler');
const AppError = require('../src/errors/AppError');
const { resetSetConfigCalled } = require('../src/config/config');
const { setConfig } = require('../src/config/config');


describe('setConfig Configuration', () => {

    beforeEach(() => {
        resetSetConfigCalled()
    })

    let req, res, next;

    beforeEach(() => {
        req = { method: 'GET', originalUrl: '/test' };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });
    
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