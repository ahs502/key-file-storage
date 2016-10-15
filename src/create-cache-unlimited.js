module.exports = function createCacheUnlimited(cacheConfig) {

    var cache = {};

    return {
        set: set,
        get: get,
        remove: remove,
        clear: clear
    };

    function set(key, value) {
        return cache[key] = value;
    }

    function get(key) {
        return cache[key];
    }

    function remove(key) {
        delete cache[key];
        return null;
    }

    function clear() {
        cache = {};
        return;
    }

};
