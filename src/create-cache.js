var createCacheUnlimited = require("./create-cache-unlimited");
var createCacheLimitedByKeyNumber = require("./create-cache-limitedbykeynumber");
var createCacheNoCache = require("./create-cache-nocache");

module.exports = function createCache(cacheConfig) {
    if (cacheConfig === true) { // Unlimited cache.
        return createCacheUnlimited(cacheConfig);
    }
    else if (typeof cacheConfig === "number" && cacheConfig > 0) { // Limited by number of keys cache.
        return createCacheLimitedByKeyNumber(cacheConfig);
    }
    else /* if(!cacheConfig) */ { // No cache.
        return createCacheNoCache(cacheConfig);
    }
};
