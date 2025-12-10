const { config } = require("../../config/config");

const customMapper = (err, req) => {
    if (config.customMappers && config.customMappers.length > 0) {
        for (const mapper of config.customMappers) {
            const mapperFunc = mapper(err, req);
            if (mapperFunc) return mapperFunc
        }
    }
}

module.exports = {customMapper}