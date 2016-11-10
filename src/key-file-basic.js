var fs = require("fs-extra");
var path = require("path");
var isValidPath = require('is-valid-path');
var recurFs = require('recur-fs');

module.exports = keyFileBasic;

function keyFileBasic(kfsPath, cache) {

    kfsPath = kfsPath || __dirname; // Current working folder by default.
    kfsPath = String(kfsPath);
    if (!isValidPath(kfsPath)) {
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
        hasAsync,

        // Iterate
        querySync,
        queryAsync

    };

    function setSync(key, value) {
        if (value === undefined) {
            return deleteSync(key);
        }
        key = validizeKey(key);
        var file = path.join(kfsPath, key);
        fs.outputJsonSync(file, value);
        return cache[key] = value;
    }

    function getSync(key) {
        key = validizeKey(key);
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
        key = validizeKey(key);
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
        key = validizeKey(key);
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
        key = validizeKey(key);
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
        key = validizeKey(key);
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
        key = validizeKey(key);
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
        key = validizeKey(key);
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

    function querySync(collection) {
        try {
            collection = path.join(kfsPath, validizeKey(collection));
            var files = recurFs.readdir.sync(collection, function(resource, stat) {
                return stat.isFile();
            });
            files = files.map(file => path.relative(kfsPath, file));
            return files || [];
        }
        catch (err) {
            return [];
        }
    }

    function queryAsync(collection) {
        return new Promise(function(resolve, reject) {
            collection = path.join(kfsPath, validizeKey(collection));
            recurFs.readdir(collection, function(resource, stat, next) {
                next(stat.isFile());
            }, function(err, resources) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(resources.map(file => path.relative(kfsPath, file)));
                }
            });
        });
    }

    ///////////////////////////////////////////////////

    function validizeKey(key) {
        key = String(key);
        if (key.indexOf('/..') >= 0 || key.indexOf('../') >= 0 || key === '..') {
            throw new Error('Invalid key name.');
        }
        return key;
    }

}