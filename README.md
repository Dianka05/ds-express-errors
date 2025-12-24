# 📦 DS Express Errors

**DS Express Errors** is library for standardizing error handling in Node.js applications built with Express.  
It provides ready-to-use error classes (HTTP Presets), a centralized error handler (middleware), automatic: database error mapping (Mongoose, Prisma, Sequelize), validation error mapping (Zod, Joi), JWT and built-in simple logging or custom loggers (Winston/Pino).

--- 

**Official website & detailed documentation with examples**: [ds-express-errors](https://ds-express-errors.dev)

---

## ✨ Features

- **Ready-to-use HTTP presets:** `BadRequest`, `NotFound`, `Unauthorized`, and others, corresponding to standard HTTP codes.  
- **Centralized handling:** One middleware catches all errors and formats them into a unified JSON response.  
- **Automatic mapping:** Converts native errors (like JWT, MongoDB duplicate key errors or Prisma/Sequelize/Zod/Joi validation errors) into clear HTTP responses.  
- **Logging:** Built-in logger with levels (`Error`, `Warning`, `Info`, `Debug`) and timestamps.  
- **Custom Logger:** Easily integrate external loggers like **Winston** or **Pino** by passing them into the configuration.
- **Security:** In production (`NODE_ENV=production`), stack traces, sensitive data are hidden; visible in development. 
- **Fully Customizable Response:** Adapt the error structure to match your API standards (JSON:API, legacy wrappers, etc.).  
- **Global Handlers:** Optional handling of `uncaughtException` and `unhandledRejection` with support for Graceful Shutdown (custom cleanup logic).
- **TypeScript support:** Includes `.d.ts` files for full typing support.

---

## 🚀 Installation

```bash
npm install ds-express-errors
```

---

## 🛠 Integration

Add errorHandler at the end of your Express middleware chain.

```js
const express = require('express');
const { errorHandler } = require('ds-express-errors');

const app = express();

// ... your routes ...

// Error handler MUST be after all routes
app.use(errorHandler);

app.listen(3000, () => console.log('Server running...'));
```

---

## 📖 Usage

### 1. Throwing Errors (Using Presets)

No need to remember status codes. Just import Errors and use the method you need.

```js
const { Errors } = require('ds-express-errors');

app.get('/users/:id', async (req, res, next) => {
    const user = await getUserById(req.params.id);

    if (!user) {
        // Automatically sends 404 with message "User not found"
        return next(Errors.NotFound('User not found'));
    }

    if (!user.isActive) {
        // Automatically sends 403
        return next(Errors.Forbidden('Access denied'));
    }

    res.json(user);
});
```

### 2. Using `AppError` (Custom Errors)

Create specific errors using the AppError class:

```js
const { AppError } = require('ds-express-errors');

// (message, statusCode, isOperational)
throw new AppError('Custom payment gateway error', 402, true);
```

### 3. Async Function Wrapper (asyncHandler)

Avoid repetitive try/catch in every controller.

```js
const { Errors, asyncHandler } = require('ds-express-errors');

const getUser = asyncHandler(async (req, res, next) => {
    const data = await database.query();
    if (!data) throw Errors.BadRequest('No data');
    res.json(data);
});

app.get('/data', getUser);
```

### 4. Global Process Handlers (Graceful Shutdown)

You can explicitly enable handling of global errors (`uncaughtException`, `unhandledRejection`). This allows you to log the crash and perform cleanup (like closing server connections) before exiting.

**Basic Usage:**
Logs the error and exits (`process.exit(1)`).

```js
const { initGlobalHandlers } = require('ds-express-errors');

// Initialize at the entry point of your app
initGlobalHandlers();
```

## Graceful Shutdown & Global Handlers (v1.5.0)

DS Express Errors provides a robust way to handle application crashes and termination signals (SIGINT, SIGTERM). It ensures your server stops accepting new connections and finishes active requests before exiting.

### `initGlobalHandlers(options)`

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `closeServer` | `Function` | `undefined` | Async function to close your HTTP server. |
| `onShutdown` | `Function` | `undefined` | Cleanup logic (e.g., disconnect DB) during normal exit. |
| `onCrash` | `Function` | `undefined` | Cleanup logic during `uncaughtException` or `unhandledRejection`. |
| `exitOnUnhandledRejection` | `Boolean` | `true` | Exit process after rejection. |
| `exitOnUncaughtException` | `Boolean` | `true` | Exit process after exception. |

### `gracefulHttpClose(server)`
A helper that wraps `server.close()` into a Promise with support for an abort signal.

### Example usage

```javascript
const { initGlobalHandlers, gracefulHttpClose } = require('ds-express-errors');

initGlobalHandlers({
  closeServer: gracefulHttpClose(server), // Gracefully close server
  onShutdown: async (signal) => {
    console.log('Cleaning up...');
    await mongoose.disconnect(); // Close DB connections
  },
  onCrash: async (err, signal) => {
    await sendAlertToAdmin(err); // Notify dev team about crash
  }
});
```

---

## 📋 Available Error Presets

All methods are available via the `Errors` object. Default `isOperational` is `true`.

| Method | Status Code | Description |
|--------|------------|-------------|
| `Errors.BadRequest(message)` | 400 | Bad Request |
| `Errors.Unauthorized(message)` | 401 | Unauthorized |
| `Errors.PaymentRequired(message)` | 402 | Payment Required |
| `Errors.Forbidden(message)` | 403 | Forbidden |
| `Errors.NotFound(message)` | 404 | Not Found |
| `Errors.Conflict(message)` | 409 | Conflict |
| `Errors.TooManyRequests(message)` | 429 | Too Many Requests |
| `Errors.InternalServerError(message)` | 500 | Internal Server Error |
| `Errors.NotImplemented(message)` | 501 | Not Implemented |
| `Errors.BadGateway(message)` | 502 | Bad Gateway |
| `Errors.ServiceUnavailable(message)` | 503 | Service Unavailable |

---

## ⚙️ Configuration & Environment Variables

- `NODE_ENV`:
  - `development` — stack trace included in response
  - `production` (or any other) — stack trace hidden, only `message` and `status` returned  

  You can define your own dev environment name using `setConfig`


### ⚙️ Configuration

- `DEBUG=true` — outputs extra debug info about error mapping (`mapErrorNameToPreset`)  

You can customize the structure of the error response sent to the client. This is useful if you need to adhere to a specific API standard (e.g., JSON:API) or hide certain fields.

Also you can customize dev environment by using `devEnvironments: []`

Use `setConfig` before initializing the error handler middleware.

```javascript
const { setConfig, errorHandler } = require('ds-express-errors');
const logger = require('./utils/logger'); // Your Winston/Pino logger

// Optional: Customize response format and Logger
setConfig({
    customLogger: logger, 
    
    customMappers: [
        (err) => {
            if (err.name === 'newError') {
                return Errors.BadRequest()
            }
        }
    ],
    devEnvironments: ['development', 'dev'],
    formatError: (err, {req, isDev}) => {
        return {
            success: false,
            error: {
                code: err.statusCode,
                message: err.message,
                ...(isDev ? { debug_stack: err.stack } : {})
            }
        };
    }
});

const app = express();
// ... your routes ...
app.use(errorHandler);
```

### 🔌 Custom Logger (New in v1.4.0)

You can connect your own logger (like Winston, Pino) instead of the built-in console logger.
The object must support 4 methods: `error`, `warn`, `info`, `debug`.

```javascript
const { setConfig } = require('ds-express-errors');
const winston = require('winston'); // Example

const logger = winston.createLogger({
    // ... your winston config
});

// Pass your logger instance
setConfig({
    customLogger: logger
});
```

**Default Response Format**

If no config is provided, the library uses the default format:

```json
{
  "status": "error", // or 'fail'
  "method": "GET", // showed when NODE_ENV= development or dev
  "url": "/api/resource", // showed when NODE_ENV= development or dev
  "message": "Error description",
  "stack": // showed when NODE_ENV= development or dev
}

```

**Default Config Format**


```javascript
let config = {
    customMappers: [],
    devEnvironments: ['dev', 'development'],
    formatError: (err, {req, isDev}) => ({ 
        status: err.isOperational ? 'fail' : 'error',
        message: err.message,
        ...(isDev ? { 
            method: req.method,
            url: req.originalUrl,
            stack: err.stack
         } : {})
    })
}
```

---

## 🛡 Third-Party Error Mapping

`mapErrorNameToPreset` automatically maps non-`AppError` instances (e.g., database errors) to HTTP responses.

**Supported mappings:**

- **JWT:** `JsonWebTokenError`, `TokenExpiredError`, `NotBeforeError` → mapped to `401 Unauthorized`
- **Validation Libraries:** `ZodError` (Zod), `ValidationError` (Joi) — automatically formatted into readable messages.
- **Mongoose / MongoDB:** `CastError`, `DuplicateKeyError` (code 11000), `ValidationError`, `MongoServerError` is handled (400 for bad JSON body, 500 for code errors).
- **Prisma:** `PrismaClientKnownRequestError`, `PrismaClientUnknownRequestError`, `PrismaClientRustPanicError`, `PrismaClientInitializationError`, `PrismaClientValidationError`
- **Sequelize:** `SequelizeUniqueConstraintError`, `SequelizeValidationError`, `SequelizeForeignKeyConstraintError` 
- **JS Native:** `ReferenceError`, `TypeError` → mapped to `500`. `SyntaxError` is handled (400 for bad JSON body, 500 for code errors).

---

## 📝 Example Client Response

**Development mode:**

```json
{
  "status": "error",
  "method": "GET",
  "url": "/api/users/999",
  "message": "User not found",
  "stack": "Error: User not found\n    at /app/controllers/user.js:15:20..."
}
```

**Production mode:**

```json
{
  "status": "error",
  "message": "User not found"
}

```
