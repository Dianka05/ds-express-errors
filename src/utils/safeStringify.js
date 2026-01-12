const safeStringify = (obj) => {
    try {
        return JSON.stringify(obj, (key, value) => 
            typeof value === 'bigint' 
                ? value.toString()
                : value 
            )
    } catch (error) {
        return `Unserializable Object ${error.message}`
    }
}

module.exports = { safeStringify }