const { config } = require("../../config/config");
const { logWarning } = require("../../logger/logger");

const customMapper = async (err, req) => {
    if (config.customMappers && config.customMappers.length > 0) {
        for (const mapper of config.customMappers) {
            try {
                const mapperFunc = mapper(err, req);

                if (mapperFunc instanceof Promise) {
                    const awaited = await mapperFunc
                    if (awaited) {
                        return awaited
                    }
                } else if (mapperFunc) return mapperFunc
            } catch (error) {
                logWarning(`Custom mapper failed: ${error}`)
            }
            
        }
    }
}

module.exports = {customMapper}