module.exports = function createCacheNoCache(cacheConfig) {

    return {
        set: set,
        get: get,
        remove: remove,
        clear: clear
    };

    function set(key, value) {
        return value;
    }

    function get(key) {
        return undefined;
    }

    function remove(key) {
        return null;
    }

    function clear() {
        return;
    }

};
