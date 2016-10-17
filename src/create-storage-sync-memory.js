module.exports = function createStorageSyncMemory(kfsPath, cache) {

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
        return cache.set(key, value);
    }

    function get(key) {
        return (cache.get(key) === undefined) ? null : cache.get(key);
    }

    function remove(key) {
        return cache.remove(key);
    }

    function clear() {
        return cache.clear();
    }

};
