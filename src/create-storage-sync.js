var fs = require("fs-extra");
var path = require("path");

module.exports = function createStorageSync(kvsPath, cache) {

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
        if (kvsPath) {
            var file = path.join(kvsPath, key);
            fs.outputJsonSync(file, value);
        }
        else {
            fsMock[key] = value;
        }
        return cache.set(key, value);
    }

    function get(key) {
        if (cache.get(key) !== undefined) {
            return cache.get(key);
        }
        if (kvsPath) {
            var file = path.join(kvsPath, key);
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
        else {
            return cache.set(key, (fsMock[key] === undefined) ? null : fsMock[key]);
        }
        return null;
    }

    function remove(key) {
        if (kvsPath) {
            var file = path.join(kvsPath, key);
            fs.removeSync(file);
        }
        else {
            delete fsMock[key];
        }
        return cache.remove(key);
    }

    function clear() {
        if (kvsPath) {
            fs.removeSync(kvsPath);
        }
        else {
            fsMock = {};
        }
        return cache.clear();
    }

};
