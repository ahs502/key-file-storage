module.exports = function createStoragePromiseMemory(kfsPath, cache) {

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
        return Promise.resolve(cache.set(key, value));
    }

    function get(key) {
        return Promise.resolve((cache.get(key) === undefined) ? null : cache.get(key));
    }

    function remove(key) {
        return Promise.resolve(cache.remove(key));
    }

    function clear() {
        return Promise.resolve(cache.clear());
    }

};
