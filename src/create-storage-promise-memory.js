var Q = require("q");

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
        return Q.when(memory[key] = value);
    }

    function get(key) {
        return Q.when((memory[key] === undefined) ? null : memory[key]);
    }

    function remove(key) {
        delete memory[key];
        return Q.when(null);
    }

    function clear() {
        memory = {};
        return Q.when();
    }

};
