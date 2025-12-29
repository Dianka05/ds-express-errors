const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj)
    } catch (error) {
        return `Unserializable Object ${error.message}`
    }
}

module.exports = {safeStringify}