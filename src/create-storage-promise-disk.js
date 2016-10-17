var fs = require("fs-extra");
var path = require("path");

module.exports = function createStoragePromiseDisk(kfsPath, cache) {

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
        return new Promise(function(resolve, reject) {
            fs.outputJson(file, value, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cache.set(key, value));
                }
            });
        });
    }

    function get(key) {
        if (cache.get(key) !== undefined) {
            return Promise.resolve(cache.get(key));
        }
        else {
            var file = path.join(kfsPath, key);
            return new Promise(function(resolve, reject) {
                fs.stat(file, function(err, stat) {
                    if (err || !stat || !stat.isFile()) {
                        resolve(cache.set(key, null));
                    }
                    else {
                        fs.readJson(file, function(err, value) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(cache.set(key, value));
                            }
                        });
                    }
                });
            });
        }
    }

    function remove(key) {
        var file = path.join(kfsPath, key);
        return new Promise(function(resolve, reject) {
            fs.remove(file, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cache.remove(key));
                }
            });
        });
    }

    function clear() {
        return new Promise(function(resolve, reject) {
            fs.remove(kfsPath, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cache.clear());
                }
            });
        });
    }

};
