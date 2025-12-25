const { initGlobalHandlers } = require('../src/middleware/errorHandler');

describe('Graceful shutdown', () => {
  let exitMock;

  beforeEach(() => {
    jest.useFakeTimers();
    exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useRealTimers();
    process.removeAllListeners('unhandledRejection');
    process.removeAllListeners('uncaughtException');
    process.removeAllListeners('SIGTERM');
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGQUIT');
  });

    test('unhandledRejection triggers onCrash and exit 1', async () => {
        const onCrash = jest.fn().mockResolvedValue();
        initGlobalHandlers({ onCrash });

        process.emit('unhandledRejection', new Error('boom'));

        await jest.advanceTimersByTimeAsync(100);

        expect(onCrash).toHaveBeenCalled();
        expect(exitMock).toHaveBeenCalledWith(1);
    });

    test('SIGTERM triggers handleServerClose and onShutdown, then exit 0', async () => {
        const closeServer = jest.fn().mockResolvedValue();
        const onShutdown = jest.fn().mockResolvedValue();
        initGlobalHandlers({ closeServer, onShutdown });

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(100);

        expect(closeServer).toHaveBeenCalled();
        expect(onShutdown).toHaveBeenCalled();
        expect(exitMock).toHaveBeenCalledWith(0);
    });

    test('AbortSignal is triggered on timeout', async () => {
        const closeServer = jest.fn(() => new Promise(() => {}));
        
        initGlobalHandlers({ closeServer });

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(10000);

        const [signal] = closeServer.mock.calls[0];
        expect(signal.aborted).toBe(true);

        expect(exitMock).toHaveBeenCalledWith(1);
    });

    test('should NOT exit if exitOnUnhandledRejection is false', async () => {
        const onCrash = jest.fn().mockResolvedValue();
        initGlobalHandlers({ onCrash, exitOnUnhandledRejection: false });

        process.emit('unhandledRejection', new Error('minor issue'));
        
        await jest.advanceTimersByTimeAsync(100);

        expect(exitMock).not.toHaveBeenCalled();
    });

    test('should exit with 1 if closeServer throws an error', async () => {
        const closeServer = jest.fn().mockRejectedValue(new Error('Port stuck'));
        const onShutdown = jest.fn().mockResolvedValue();
        
        initGlobalHandlers({ closeServer, onShutdown });

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(100);

        expect(exitMock).toHaveBeenCalledWith(1);
        expect(onShutdown).toHaveBeenCalled();
    });

    test.each(['SIGINT', 'SIGQUIT'])('should handle %s signal correctly', async (signal) => {
        const onShutdown = jest.fn().mockResolvedValue();
        initGlobalHandlers({ onShutdown });

        process.emit(signal);

        await jest.advanceTimersByTimeAsync(100);

        expect(onShutdown).toHaveBeenCalled();
        expect(exitMock).toHaveBeenCalledWith(0);
    });

    test('should handle missing handlers gracefully', async () => {
        initGlobalHandlers();

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(100);

        expect(exitMock).toHaveBeenCalledWith(0);
    });

    test('onCrash should receive the error and abort signal', async () => {
        const onCrash = jest.fn().mockResolvedValue();
        const error = new Error('The core is melting');
        
        initGlobalHandlers({ onCrash });

        process.emit('uncaughtException', error);

        await jest.advanceTimersByTimeAsync(100);

        expect(onCrash).toHaveBeenCalledWith(error, expect.any(AbortSignal));
        expect(exitMock).toHaveBeenCalledWith(1);
    });

    test('should exit 1 even if onCrash itself fails', async () => {
        const onCrash = jest.fn().mockRejectedValue(new Error('onCrash failed'));
        initGlobalHandlers({ onCrash });

        process.emit('unhandledRejection', new Error('initial error'));

        await jest.advanceTimersByTimeAsync(100);

        expect(exitMock).toHaveBeenCalledWith(1);
    });

    test('should exit 1 and abort signal if closeServer hangs', async () => {
        const closeServer = jest.fn(() => new Promise(() => {}));
        initGlobalHandlers({ closeServer });

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(10000);

        const [signal] = closeServer.mock.calls[0];
        expect(signal.aborted).toBe(true);
        expect(exitMock).toHaveBeenCalledWith(1); 
    });
    test('should handle multiple failures in parallel shutdown', async () => {
        const closeServer = jest.fn().mockRejectedValue(new Error('Server fail'));
        const onShutdown = jest.fn().mockRejectedValue(new Error('DB fail'));
        
        initGlobalHandlers({ closeServer, onShutdown });

        process.emit('SIGTERM');

        await jest.advanceTimersByTimeAsync(100);

        expect(exitMock).toHaveBeenCalledWith(1);
    });
});