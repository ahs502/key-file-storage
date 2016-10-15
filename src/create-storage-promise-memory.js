var Q = require("q");

module.exports = function createStoragePromiseMemory(kvsPath, cache) {

    return {
        set: set,
        get: get,
        remove: remove,
        clear: clear
    };

    function set(key, value) {
        if (value === undefined) {
            return remove(key);
        }
        return Q.when(cache.set(key, value));
    }

    function get(key) {
        return Q.when((cache.get(key) === undefined) ? null : cache.get(key));
    }

    function remove(key) {
        return Q.when(cache.remove(key));
    }

    function clear() {
        return Q.when(cache.clear());
    }

};
