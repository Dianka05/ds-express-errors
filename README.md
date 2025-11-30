# 📦 DS Express Errors

**DS Express Errors** is library for standardizing error handling in Node.js applications built with Express.  
It provides ready-to-use error classes (HTTP Presets), a centralized error handler (middleware), automatic database error mapping (Mongoose, Prisma, Sequelize), and built-in logging.

---

## ✨ Features

- **Ready-to-use HTTP presets:** `BadRequest`, `NotFound`, `Unauthorized`, and others, corresponding to standard HTTP codes.  
- **Centralized handling:** One middleware catches all errors and formats them into a unified JSON response.  
- **Automatic mapping:** Converts native errors (like JWT, MongoDB duplicate key errors or Prisma/Sequelize/Zod/Joi validation errors) into clear HTTP responses.  
- **Logging:** Built-in logger with levels (`Error`, `Warning`, `Info`, `Debug`) and timestamps.  
- **Security:** In production (`NODE_ENV=production`), stack traces are hidden; visible in development.  
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

**Advanced Usage (Custom Crash Logic):**
Use `onCrash` to define custom behavior, such as closing the database or server gracefully.

**Note**: When using `onCrash`, you are responsible for exiting the process manually!

```js
const { initGlobalHandlers } = require('ds-express-errors');

const server = app.listen(3000);

initGlobalHandlers({
    onCrash: () => {
        console.error('⚠️ Crash detected! Closing server...');
        server.close(() => {
            console.log('✅ Server closed. Exiting process.');
            process.exit(1); 
        });
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
| `Errors.InternalServerError(message)` | 500 | Internal Server Error |
| `Errors.NotImplemented(message)` | 501 | Not Implemented |
| `Errors.BadGateway(message)` | 502 | Bad Gateway |
| `Errors.ServiceUnavailable(message)` | 503 | Service Unavailable |

---

## ⚙️ Configuration & Environment Variables

- `NODE_ENV`:
  - `development` — stack trace included in response  
  - `production` (or any other) — stack trace hidden, only `message` and `status` returned  

- `DEBUG=true` — outputs extra debug info about error mapping (`mapErrorNameToPreset`)  

---

## 🛡 Third-Party Error Mapping

`mapErrorNameToPreset` automatically maps non-`AppError` instances (e.g., database errors) to HTTP responses.

**Supported mappings:**

- **JWT:** `JsonWebTokenError`, `TokenExpiredError`, `NotBeforeError` → mapped to `401 Unauthorized`
- **Validation Libraries:** `ZodError` (Zod), `ValidationError` (Joi) — automatically formatted into readable messages.
- **Mongoose / MongoDB:** `CastError`, `DuplicateKeyError` (code 11000), `ValidationError`  
- **Prisma:** `PrismaClientKnownRequestError`, `PrismaClientUnknownRequestError`  
- **Sequelize:** `SequelizeUniqueConstraintError`, `SequelizeValidationError`  
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
  "method": "GET",
  "url": "/api/users/999",
  "message": "User not found"
}

```
