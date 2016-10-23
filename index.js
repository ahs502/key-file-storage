var fs = require("fs-extra");
var path = require("path");

function keyFileStorage(kfsPath, cacheConfig) {

    if (kfsPath === undefined) {
        kfsPath = __dirname; // Current working folder by default.
    }
    else if (typeof kfsPath !== 'string') {
        throw new Error('Invalid stroage path.');
    }
    // Now kfsPath is a string !

    var cache;
    if (cacheConfig === true || typeof cacheConfig === 'undefined') { // Unlimited cache by default
        cache = { /*CACHE*/ };
    }
    else if (cacheConfig === false) { // No cache
        cache = createCache_NoCache(cacheConfig);
    }
    else if (typeof cacheConfig === 'number' && cacheConfig > 0) { // Limited cache by the number of keys
        cache = createCache_LimitedByKeyCount(cacheConfig);
    }
    else {
        throw new Error('Invalid cache config.');
    }

    // The produced promise or callback function related to the latest async 'in' operator
    var hasAsyncHandler = null;

    /* async has */
    var hasAsyncWrap = {
        has: function(target, property) {
            var promise = hasAsync(property);
            if (typeof hasAsyncHandler === 'function') {
                callbackizePromise(promise, hasAsyncHandler);
            }
            else {
                hasAsyncHandler = promise;
            }
            return false; // No synchronous answer.
        }
    };

    var kfs = new Proxy(function() {

        var a1 = arguments[0],
            a2 = arguments[1],
            a3 = arguments[2];

        switch (arguments.length) {

            case 0:
                if (hasAsyncHandler) {
                    a3 = hasAsyncHandler;
                    hasAsyncHandler = null;
                    return a3;
                }
                else {
                    return new Proxy({}, hasAsyncWrap);
                }
                // break;

            case 1:
                if (typeof a1 === 'function') {
                    if (hasAsyncHandler) {
                        a3 = hasAsyncHandler;
                        hasAsyncHandler = null;
                        return callbackizePromise(a3, a1);
                    }
                    else {
                        hasAsyncHandler = a1;
                        return new Proxy({}, hasAsyncWrap);
                    }
                }
                else {
                    /* async get pr */
                    return getAsync(a1);
                }
                // break;

            case 2:
                if (typeof a2 === 'function') {
                    /* async get cb */
                    return callbackizePromise(getAsync(a1), a2);
                }
                else {
                    /* async set pr */
                    return setAsync(a1, a2);
                }
                // break;

            case 3:
                if (typeof a3 === 'function') {
                    /* async set cb */
                    return callbackizePromise(setAsync(a1, a2), a3);
                }
                // break;

        }

        throw new Error('Invalid input argument(s).');

    }, {

        /* sync set */
        set: function(target, property, value, receiver) {
            return setSync(property, value);
        },

        /* sync get */
        get: function(target, property, receiver) {
            return getSync(property);
        },

        /* sync delete */
        deleteProperty: function(target, property) {
            return deleteSync(property);
        },

        /* sync has */
        has: function(target, property) {
            return hasSync(property);
        },

        /* async delete */
        construct: function(target, argumentsList, newTarget) {

            var a1 = argumentsList[0],
                a2 = argumentsList[1];

            switch (argumentsList.length) {

                case 0:
                    return clearAsync();
                    // break;

                case 1:
                    return deleteAsync(a1);
                    // break;

                case 2:
                    return callbackizePromise(deleteAsync(a1), a2);
                    // break;

            }

            throw new Error('Invalid input argument(s).');

        }

    });

    return kfs;

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

    function callbackizePromise(promise, callback) {
        if (typeof callback === "function") {
            return promise.then(function(data) {
                return callback(undefined, data);
            }, callback);
        }
        else {
            return promise;
        }
    }

    function createCache_NoCache(cacheConfig) {

        return new Proxy({ /*CACHE*/ }, {

            set: function(target, property, value, receiver) {
                return value;
            },

            get: function(target, property, receiver) {
                return undefined;
            },

            deleteProperty: function(target, property) {
                return true;
            },

            has: function(target, property) {
                return false;
            }

        });

    }

    function createCache_LimitedByKeyCount(cacheConfig) {

        var keyNumber = Math.ceil(cacheConfig),
            keys = Array(keyNumber),
            nextKeyIndex = 0,
            keyIndex;

        return new Proxy({ /*CACHE*/ }, {

            set: function(target, property, value, receiver) {
                updateKeys(target, property, 'set');
                return target[property] = value;
            },

            get: function(target, property, receiver) {
                updateKeys(target, property, 'get');
                return target[property];
            },

            deleteProperty: function(target, property) {
                if (property === '*') {
                    keys = Array(keyNumber);
                    nextKeyIndex = 0;
                    return true;
                }
                updateKeys(target, property, 'del');
                return delete target[property];
            },

            has: function(target, property) {
                return keys.indexOf(property) >= 0;
            }

        });

        function realIndex(i) {
            return (i + keyNumber) % keyNumber;
        }

        function updateKeys(target, property, mode) {
            keyIndex = keys.indexOf(property);
            if (keyIndex < 0) { // Does not exist
                (mode === 'set') && addKey();
            }
            else if (keyIndex === realIndex(nextKeyIndex - 1)) { // The latest key
                (mode === 'del') && removeKey();
            }
            else { // Otherwise
                removeKey();
                (mode === 'del') || addKey();
            }

            function removeKey() {
                while (keyIndex !== nextKeyIndex && keys[keyIndex]) {
                    keys[keyIndex] = keys[realIndex(keyIndex - 1)];
                    keyIndex = realIndex(keyIndex - 1);
                }
                keys[nextKeyIndex] = undefined;
            }

            function addKey() {
                if (keys[nextKeyIndex] !== property) {
                    if (keys[nextKeyIndex] !== undefined)
                        delete target[keys[nextKeyIndex]];
                    keys[nextKeyIndex] = property;
                }
                nextKeyIndex = realIndex(nextKeyIndex + 1);
            }
        }

    }

}

module.exports = keyFileStorage;
