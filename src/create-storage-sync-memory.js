module.exports = function createStorageSyncMemory(kvsPath, cache) {

    var fsMock = {};

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
        return fsMock[key] = value;
    }

    function get(key) {
        return (fsMock[key] === undefined) ? null : fsMock[key];
    }

    function remove(key) {
        delete fsMock[key];
        return null;
    }

    function clear() {
        fsMock = {};
        return;
    }

};
