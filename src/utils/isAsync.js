function isAsync(fn) {
   return fn.constructor.name === 'AsyncFunction';
}

module.exports = isAsync