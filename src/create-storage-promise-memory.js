module.exports = function createStoragePromiseMemory(kvsPath, cache) {

    var memory = {};

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
        return Promise.resolve(memory[key] = value);
    }

    function get(key) {
        return Promise.resolve((memory[key] === undefined) ? null : memory[key]);
    }

    function remove(key) {
        delete memory[key];
        return Promise.resolve(null);
    }

    function clear() {
        memory = {};
        return Promise.resolve();
    }

};
