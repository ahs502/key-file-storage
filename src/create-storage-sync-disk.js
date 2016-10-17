var fs = require("fs-extra");
var path = require("path");

module.exports = function createStorageSync(kfsPath, cache) {

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
        var file = path.join(kfsPath, key);
        fs.outputJsonSync(file, value);
        return cache.set(key, value);
    }

    function get(key) {
        if (cache.get(key) !== undefined) {
            return cache.get(key);
        }
        var file = path.join(kfsPath, key);
        try {
            var stat = fs.statSync(file);
            if (!stat || !stat.isFile()) {
                return cache.set(key, null);
            }
            return cache.set(key, fs.readJsonSync(file));
        }
        catch (err) {
            return cache.set(key, null);
        }
    }

    function remove(key) {
        var file = path.join(kfsPath, key);
        fs.removeSync(file);
        return cache.remove(key);
    }

    function clear() {
        fs.removeSync(kfsPath);
        return cache.clear();
    }

};
