var fs = require("fs-extra");
var path = require("path");

module.exports = keyFileBasic;

function keyFileBasic(kfsPath, cache) {

    if (kfsPath === undefined) {
        kfsPath = __dirname; // Current working folder by default.
    }
    else if (typeof kfsPath !== 'string') {
        throw new Error('Invalid stroage path.');
    }

    return {

        // Synchronous
        setSync,
        getSync,
        deleteSync,
        clearSync,
        hasSync,

        // Asynchronous
        setAsync,
        getAsync,
        deleteAsync,
        clearAsync,
        hasAsync

    };

    function setSync(key, value) {
        if (value === undefined) {
            return deleteSync(key);
        }
        key = String(key);
        var file = path.join(kfsPath, key);
        fs.outputJsonSync(file, value);
        return cache[key] = value;
    }

    function getSync(key) {
        key = String(key);
        if (key in cache) {
            return cache[key];
        }
        var file = path.join(kfsPath, key);
        try {
            var stat = fs.statSync(file);
            if (!stat || !stat.isFile()) {
                return cache[key] = null;
            }
        }
        catch (err) {
            return cache[key] = null;
        }
        return cache[key] = fs.readJsonSync(file);
    }

    function deleteSync(key) {
        key = String(key);
        if (key === '*') {
            return clearSync();
        }
        var file = path.join(kfsPath, key);
        fs.removeSync(file);
        return delete cache[key];
    }

    function clearSync() {
        fs.removeSync(kfsPath);
        if (cache.constructor === Object) {
            cache = { /*NEW-EMPTY-CACHE*/ };
            return true;
        }
        else {
            return delete cache['*'];
        }
    }

    function hasSync(key) {
        key = String(key);
        if (key in cache) {
            return true;
        }
        var file = path.join(kfsPath, key);
        try {
            var stat = fs.statSync(file);
            if (!stat || !stat.isFile()) {
                return false;
            }
        }
        catch (err) {
            return false;
        }
        return true;
    }

    function setAsync(key, value) {
        if (value === undefined) {
            return deleteAsync(key);
        }
        key = String(key);
        var file = path.join(kfsPath, key);
        return new Promise(function(resolve, reject) {
            fs.outputJson(file, value, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cache[key] = value);
                }
            });
        });
    }

    function getAsync(key) {
        key = String(key);
        if (key in cache) {
            return Promise.resolve(cache[key]);
        }
        else {
            var file = path.join(kfsPath, key);
            return new Promise(function(resolve, reject) {
                fs.stat(file, function(err, stat) {
                    if (err || !stat || !stat.isFile()) {
                        resolve(cache[key] = null);
                    }
                    else {
                        fs.readJson(file, function(err, value) {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(cache[key] = value);
                            }
                        });
                    }
                });
            });
        }
    }

    function deleteAsync(key) {
        key = String(key);
        if (key === '*') {
            return clearAsync();
        }
        var file = path.join(kfsPath, key);
        return new Promise(function(resolve, reject) {
            fs.remove(file, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(delete cache[key]);
                }
            });
        });
    }

    function clearAsync() {
        return new Promise(function(resolve, reject) {
            fs.remove(kfsPath, function(err) {
                if (err) {
                    reject(err);
                }
                else {
                    if (cache.constructor === Object) {
                        cache = { /*NEW-EMPTY-CACHE*/ };
                        resolve(true);
                    }
                    else {
                        resolve(delete cache['*']);
                    }
                }
            });
        });
    }

    function hasAsync(key) {
        key = String(key);
        if (key in cache) {
            return Promise.resolve(true);
        }
        else {
            var file = path.join(kfsPath, key);
            return new Promise(function(resolve, reject) {
                fs.stat(file, function(err, stat) {
                    if (err || !stat || !stat.isFile()) {
                        resolve(false);
                    }
                    else {
                        resolve(true);
                    }
                });
            });
        }
    }

}