var createCache = require("./src/create-cache");
var createStoragePromise = require("./src/create-storage-promise");
var createStorageSync = require("./src/create-storage-sync");

function keyFileStorage(kvsPath, cacheConfig) {

    (cacheConfig === undefined) && (cacheConfig = true);

    var cache = createCache(cacheConfig),
        storagePromise = createStoragePromise(kvsPath, cache),
        storageSync = createStorageSync(kvsPath, cache);

    return {

        // Asynchronous API :
        set: set,
        get: get,
        remove: remove,
        clear: clear,

        // Synchronous API :
        setSync: storageSync.set,
        getSync: storageSync.get,
        removeSync: storageSync.remove,
        clearSync: storageSync.clear,

    };

    function set(key, value, callbackErr /*(err)*/ ) {
        return _callbackizePromise(storagePromise.set(key, value), callbackErr);
    }

    function get(key, callbackErrValue /*(err, value)*/ ) {
        return _callbackizePromise(storagePromise.get(key), callbackErrValue);
    }

    function remove(key, callbackErr /*(err)*/ ) {
        return _callbackizePromise(storagePromise.remove(key), callbackErr);
    }

    function clear(callbackErr /*(err)*/ ) {
        return _callbackizePromise(storagePromise.clear(), callbackErr);
    }

    function _callbackizePromise(promise, callback) {
        if (typeof callback === "function") {
            return promise.then(function(data) {
                return callback(undefined, data);
            }, callback);
        }
        else {
            return promise;
        }
    }

}

module.exports = keyFileStorage;
