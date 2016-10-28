var createCache = require("./src/create-cache");
var createKfs = require("./src/key-file-storage");

module.exports = keyFileStorage;

function keyFileStorage(kfsPath, cacheConfig) {

    var cache = createCache(cacheConfig);

    var kfs = createKfs(kfsPath, cache);

    return kfs;

}
