# Changelog

All notable changes to this project will be documented in this file.

---

## [1.8.0] – 2026-01-11 (latest)

- Added support for user-provided error classes in custom mappers (Zod, Joi)
- Added support for turning only needed mappers in config
- rate limiting logger
- Express-validator mapper fix incorrect logic
- Expand prisma errors ['`P2005`', `P2006`, `P2007`, `P2011`, `P2027`]
- updated mongoose & sequelize mappers check

---

## [1.7.1] – 2026-01-07

### Changed
- Improved validation checks for `setConfig`
- Enhanced environment configuration checks

### Fixed
- Log injection vulnerability
- Crash in custom mappers when returning Promises or async functions
- Missing fallback `statusCode` for `defaultErrorAnswer`


---

## [1.7.0] – 2026-01-05

### Added
- Express-validator support

### Changed
- Updated check logic in Mongoose & Prisma mappers
- Added validation check for `setConfig`
- Refactored internal logic

### Fixed
- Logger bug

---

## [1.6.0] – 2025-12-29

### Added
- Extended Prisma error support:
  `P2000`, `P2001`, `P2002`, `P2003`, `P2014`, `P2015`, `P2021`,
  `P2022`, `P2025`, `P1001`, `P1002`, `P1003`
- `maxTimeout` support for `initGlobalHandlers`

---

## [1.5.1] – 2025-12-25

### Fixed
- Handling `Error` in `customMappers`

---

## [1.5.0] – 2025-12-25

### Added
- Full graceful shutdown support in `initGlobalHandlers`

---

## [1.4.1] – 2025-12-12

### Added
- Type definitions for `Errors`

---

## [1.4.0] – 2025-12-11

### Added
- Support for custom loggers (Winston / Pino)

### Changed
- Refactored error mapping logic for better maintainability

---

## [1.3.4] – 2025-12-08

### Fixed
- Response handling for `SyntaxError` on invalid JSON

---

## [1.3.3] – 2025-12-08

### Changed
- Updated deprecated information

---

## [1.3.2] – 2025-12-08

### Changed
- Refactored code and removed deprecated methods
- Hidden sensitive error information in production

---

## [1.3.1] – 2025-12-07

### Added
- `safeStringify` method to prevent circular references

### Fixed
- Various error handling issues

---

## [1.3.0] – 2025-12-07

### Changed
- Improved `initGlobalHandlers`
- Made `onCrash` async

---

## [1.2.0] – 2025-12-07

### Added
- `devEnvironments[]` configuration option
- `customMappers` support for custom error mapping

### Changed
- Refactored code and TypeScript definitions
- Improved support for Mongoose, Sequelize, and Prisma errors

---

## [1.1.2] – 2025-12-05

### Fixed
- Type definition issues

---

## [1.1.1] – 2025-12-05

### Changed
- Improved config settings
- Refactored `formatError`

### Fixed
- Type definitions and minor bugs

---

## [1.1.0] – 2025-12-05

### Added
- Configuration support
- Custom error format support

---

## [1.0.7] – 2025-12-05

### Added
- New error presets

---

## [1.0.6] – 2025-12-04

### Changed
- Updated deprecated information

---

## [1.0.5] – 2025-11-30

### Added
- `initGlobalHandlers` for uncaught exceptions and unhandled rejections
- Type definitions

---

## [1.0.4] – 2025-11-28

### Changed
- Refactored status code handling
- Removed deprecated imports

### Added
- Additional error presets

### Fixed
- Various bugs

---

## [1.0.3] – 2025-11-27

### Changed
- Updated deprecated information
- Improved `mapErrorNameToPreset`

### Fixed
- Bugs and type definition issues

---

## [1.0.2] – 2025-11-25

### Fixed
- Bugs and deprecated usage

---

## [1.0.1] – 2025-11-24

### Added
- Type definitions
- Async handler

### Changed
- Improved error handler

### Fixed
- Bugs and unhandled promise rejections

---

## [1.0.0] – 2025-11-24

### Added
- Initial release
