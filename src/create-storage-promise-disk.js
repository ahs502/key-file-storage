var fs = require("fs-extra");
var path = require("path");
var Q = require("q");

module.exports = function createStoragePromiseDisk(kvsPath, cache) {

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
        var file = path.join(kvsPath, key),
            deferred = Q.defer();
        fs.outputJson(file, value, function(err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(cache.set(key, value));
            }
        });
        return deferred.promise;
    }

    function get(key) {
        if (cache.get(key) !== undefined) {
            return Q.when(cache.get(key));
        }
        else {
            var file = path.join(kvsPath, key),
                deferred = Q.defer();
            fs.stat(file, function(err, stat) {
                if (err || !stat || !stat.isFile()) {
                    deferred.resolve(cache.set(key, null));
                }
                else {
                    fs.readJson(file, function(err, value) {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve(cache.set(key, value));
                        }
                    });
                }
            });
            return deferred.promise;
        }
    }

    function remove(key) {
        var file = path.join(kvsPath, key),
            deferred = Q.defer();
        fs.remove(file, function(err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(cache.remove());
            }
        });
        return deferred.promise;
    }

    function clear() {
        var deferred = Q.defer();
        fs.remove(kvsPath, function(err) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(cache.clear());
            }
        });
        return deferred.promise;
    }

};
