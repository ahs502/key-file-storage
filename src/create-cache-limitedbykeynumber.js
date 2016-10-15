module.exports = function createCacheLimitedByKeyNumber(cacheConfig) {

    var cache = {},
        keys = [],
        keyNumber = Math.round(cacheConfig);

    return {
        set: set,
        get: get,
        remove: remove,
        clear: clear
    };

    function set(key, value) {
        var i;
        if ((i = keys.indexOf(key)) >= 0) {
            keys.splice(i, 1);
        }
        else {
            var droppedKeys = keys.splice(keyNumber - 1);
            droppedKeys.forEach(function(droppedKey) {
                delete cache[droppedKey];
            });
        }
        keys = [key].concat(keys);
        return cache[key] = value;
    }

    function get(key) {
        var i;
        if ((i = keys.indexOf(key)) > 0) {
            keys.splice(i, 1);
            keys = [key].concat(keys);
        }
        return cache[key];
    }

    function remove(key) {
        var i;
        if ((i = keys.indexOf(key)) >= 0) {
            keys.splice(i, 1);
            delete cache[key];
        }
        return null;
    }

    function clear() {
        keys = [];
        cache = {};
        return;
    }

};
