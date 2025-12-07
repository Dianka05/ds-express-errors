const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj)
    } catch (error) {
        return `Unserializeble Object ${error.message}`
    }
}

module.exports = {safeStringify}